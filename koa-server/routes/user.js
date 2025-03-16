import Router from '@koa/router';
import Joi from 'joi';
import { generateTokens, verifyToken } from '../utils/jwt.js';
import User from '../models/user.js';
import bcrypt from 'bcrypt';
import redis from "../lib/RedisClient.js";

const router = new Router({ prefix: '/auth' });

// 参数校验 Schema
const schemas = {
  register: Joi.object({
    email: Joi.string().email().required().label('邮箱'),
    password: Joi.string().min(8).max(30).required().label('密码'),
    username: Joi.string().min(2).max(20).required().label('用户名'),
    phone: Joi.string().pattern(/^1[3-9]\d{9}$/).label('手机号')
  }),

  login: Joi.object({
    identifier: Joi.string().required().label('登录凭证'),
    password: Joi.string().required().label('密码')
  }),

  updateProfile: Joi.object({
    username: Joi.string().min(2).max(20),
    email: Joi.string().email(),
    phone: Joi.string().pattern(/^1[3-9]\d{9}$/),
    avatar: Joi.string().uri(),
    gender: Joi.string().valid('male', 'female', 'other'),
    age: Joi.number().min(1).max(120),
    bio: Joi.string().max(200),
    password: Joi.string().min(8).max(30)
  })
};

/**
 * 用户注册接口
 * @body {Object} 
 *   - email {string} 邮箱（必须，唯一）
 *   - password {string} 密码（必须，8-30位）
 *   - username {string} 用户名（必须，2-20位）
 *   - phone {string} 手机号（可选，需符合格式）
 */
router.post('/register', async (ctx) => {
  // 参数校验
  const { error, value } = schemas.register.validate(ctx.request.body);
  if (error) ctx.throw(400, error.details.message);

  // 创建用户（自动处理唯一性错误）
  const hashedPassword = await bcrypt.hash(value.password, 10);
  const user = await User.create({
    ...value,
    password: hashedPassword,
    status: 'active'
  }).catch(handleMongoError(ctx));

  // 生成令牌
  const tokens = generateTokens(user._id);
  
  ctx.status = 201;
  ctx.body = {
    id: user._id,
    ...tokens,
    profile: user.filterSafeFields()
  };
});

/**
 * 用户登录接口
 * @body {Object}
 *   - identifier {string} 登录凭证（用户名/邮箱/手机号）
 *   - password {string} 密码
 */
router.post('/login', async (ctx) => {
  // 参数校验
  const { error, value } = schemas.login.validate(ctx.request.body);
  if (error) ctx.throw(400, error.details.message);

  // 查询用户（带账号状态检查）
  const user = await User.findOne({
    $or: [
      { email: value.identifier },
      { username: value.identifier },
      { phone: value.identifier }
    ],
    status: 'active'
  }).select('+password');

  // 密码验证
  if (!user || !(await bcrypt.compare(value.password, user.password))) {
    ctx.throw(401, '用户名或密码错误');
  }

  ctx.body = {
    ...generateTokens(user._id),
    profile: user.filterSafeFields()
  };
});

/**
 * 用户信息更新接口
 * @header Authorization Bearer Token
 * @body {Object} updates 可更新字段
 */
router.patch('/profile', verifyToken, async (ctx) => {
  // 参数校验
  const { error, value } = schemas.updateProfile.validate(ctx.request.body);
  if (error) ctx.throw(400, error.details.message);

  // 密码单独处理
  if (value.password) {
    value.password = await bcrypt.hash(value.password, 10);
  }

  // 执行更新
  const user = await User.findByIdAndUpdate(
    ctx.state.userId,
    { $set: value },
    { new: true, runValidators: true }
  ).catch(handleMongoError(ctx));

  ctx.body = { profile: user.filterSafeFields() };
});

/**
 * 用户注销接口
 * @header Authorization Bearer Token
 */
router.post('/logout', verifyToken, async (ctx) => {
  const token = ctx.headers.authorization.split(' ');
  const decoded = verifyToken(token);
  
  // 加入黑名单（剩余有效期自动计算）
  const remainingTime = decoded.exp - Math.floor(Date.now() / 1000);
  if (remainingTime > 0) {
    await redis.set(`blacklist:${token}`, '1', 'EX', remainingTime);
  }
  
  ctx.status = 204;
});

// 统一处理 MongoDB 错误
function handleMongoError(ctx) {
  return (err) => {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern);
      ctx.throw(409, `${field} 已被使用`);
    }
    ctx.throw(500, '数据库操作失败');
  };
}
