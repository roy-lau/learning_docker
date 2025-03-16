// utils/jwt.js
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import redis from "../lib/RedisClient.js";

/**
 * 生成双令牌机制
 * @param {string|Object} userId - 用户唯一标识（建议使用 MongoDB ObjectId）
 * @returns {Promise<{accessToken: string, refreshToken: string}>}
 * @throws {Error} 当参数不合法或 Redis 操作失败时抛出异常
 */
export const generateTokens = async (userId) => {
  // 参数有效性验证
  if (!userId || typeof userId !== 'string') {
    throw new Error('Invalid user identifier');
  }

  // 生成访问令牌（15分钟有效期）
  const accessToken = jwt.sign(
    { sub: userId },
    process.env.JWT_SECRET,
    { 
      expiresIn: '15m',
      algorithm: 'HS256', // 强制指定算法类型
      issuer: 'your-app-name', // 增加签发者标识
      audience: 'client' // 明确受众范围
    }
  );

  // 生成密码学安全的刷新令牌（RFC 4122 UUID v4）
  const refreshToken = crypto.randomUUID();
  
  try {
    // 存储刷新令牌到 Redis（7天有效期）
    await redis.set(`refresh:$${userId}`, refreshToken, 'EX', 604800);
  } catch (err) {
    throw new Error(`Redis operation failed: $${err.message}`);
  }

  return { accessToken, refreshToken };
};

/**
 * JWT 验证中间件
 * @param {Object} ctx - Koa 上下文对象
 * @param {Function} next - 中间件继续函数
 * @throws {401} 当认证失败时抛出 HTTP 401 错误
 */
export const verifyToken = async (ctx, next) => {
  // 从 Authorization 头提取令牌
  const authHeader = ctx.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    ctx.throw(401, 'Authorization header format: Bearer <token>');
  }

  const token = authHeader.split(' ');
  if (!token) ctx.throw(401, 'Missing authentication token');

  try {
    // 验证令牌并解码
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'], // 限制允许的算法
      issuer: 'your-app-name', // 验证签发者
      audience: 'client' // 验证受众
    });

    // 注入用户标识到上下文
    ctx.state.userId = decoded.sub;
  } catch (err) {
    // 细化错误类型处理
    switch (err.name) {
      case 'TokenExpiredError':
        ctx.throw(401, 'Token expired', { code: 'TOKEN_EXPIRED' });
      case 'JsonWebTokenError':
        ctx.throw(401, 'Invalid token format', { code: 'INVALID_TOKEN' });
      case 'NotBeforeError':
        ctx.throw(401, 'Token not active', { code: 'TOKEN_INACTIVE' });
      default:
        ctx.throw(401, 'Authentication failed');
    }
  }

  await next();
};
