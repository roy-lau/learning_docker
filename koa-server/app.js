import Koa from "koa";
import Router from "@koa/router";
import bodyParser from "koa-bodyparser";
import ratelimit from "koa-ratelimit";
import jsonError from "koa-json-error";
import helmet from "koa-helmet";
import cors from "@koa/cors";
import logger from "./utils/logger.js";
import redis from "./lib/RedisClient.js";
import { logHandler, errorHandler } from "./middleware/index.js";
import { v4 as uuidv4 } from "uuid";
import testrouter from "./routes/test.js";

console.log("nodejs env === ", process.env);
// console.log("testrouter === ", testrouter);
/**
 * 创建 Koa 应用实例
 * @type {Koa} Koa 应用对象
 */
const app = new Koa();
// const router = new Router(); // API 版本控制
const router = new Router({ prefix: "/v1" }); // API 版本控制

// 请求体解析器 (支持 JSON/Form)
app.use(
  bodyParser({
    enableTypes: ["json", "form"],
    jsonLimit: "10mb", // 设置最大 JSON 载荷
  })
);

/**
 * 统一响应格式中间件
 * 自动包装 JSON 响应结构
 */
app.use(async (ctx, next) => {
  await next();
  if (ctx.body && typeof ctx.body === "object") {
    ctx.body = {
      success: ctx.status < 400, // 状态标识
      code: ctx.status, // HTTP 状态码
      data: ctx.body, // 业务数据
      timestamp: Date.now(), // 服务器时间戳
    };
  }
});


app.use(jsonError({
  format: (err) => ({
    code: err.status || 500,
    msg: err.message,
    data: null
  }),
  postFormat: (e, { stack, ...rest }) => 
    process.env.NODE_ENV === 'production' ? rest : { ...rest, stack }
}));

// ======================
// 中间件配置模块
// ======================

/**
 * 分布式限流策略（Redis驱动）
 * - 基于 IP 的全局速率限制
 * - 60 秒窗口期最多 100 请求
 * - 生产环境推荐使用 Redis 集群模式
 */
app.use(
  ratelimit({
    driver: "redis",
    db: redis.client, // 复用现有 Redis 连接
    duration: 60_000, // 时间窗口(毫秒)
    max: 100, // 最大请求数
    id: (ctx) => ctx.ip, // 基于客户端IP识别
    disableHeader: true, // 禁用默认响应头
    errorMessage: "Rate limit exceeded",
  })
);

/**
 * 安全头增强配置
 * - 启用 CSP 内容安全策略
 * - 自动设置 XSS 过滤头
 * - 禁用 MIME 类型嗅探
 */
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        objectSrc: ["'none'"], // 禁止插件内容加载
      },
    },
    hsts: { maxAge: 31536000, includeSubDomains: true }, // 强制 HTTPS
    noSniff: true, // 禁止 MIME 嗅探
  })
);

/**
 * 精细化 CORS 配置
 * - 动态 Origin 白名单验证
 * - 暴露自定义响应头
 * - 启用跨域凭证传递
 */
const whitelist = JSON.parse(process.env.CORS_WHITELIST || "[]");
app.use(
  cors({
    origin: (ctx) => {
      const origin = ctx.get("Origin");
      return whitelist.includes(origin) ? origin : "";
    },
    exposeHeaders: ["X-Request-Id", "Content-Range", "X-RateLimit-Limit"],
    maxAge: 600, // 预检缓存时间(秒)
    credentials: true, // 允许携带 Cookie
    allowMethods: ["GET", "POST", "PUT", "DELETE"], // 限制 HTTP 方法
    allowHeaders: ["Content-Type", "Authorization"], // 限制请求头
  })
);
// 跨域处理 (生产环境应配置白名单)
// .use(cors({ origin: '*' }))

/**
 * 全链路追踪中间件
 * - 生成唯一请求 ID
 * - 注入上下文追踪标识
 * - 设置响应头用于前端监控
 */
app.use(async (ctx, next) => {
  ctx.state.traceId = uuidv4(); // 使用 UUID v4 生成
  ctx.set("X-Request-ID", ctx.state.traceId);
  ctx.set("X-Trace-Node", process.env.NODE_ID); // 微服务环境标识
  await next();
});

// 路由挂载
app.use(router.routes()).use(router.allowedMethods()); // 自动处理 405/501 状态
app.use(testrouter.routes()).use(testrouter.allowedMethods());

/**
 * 增强版请求日志中间件
 * - 记录完整请求生命周期
 * - 集成 traceID 追踪
 * - 记录响应时间指标
 */
app.use(logHandler); // 需确保在中间件链最前端

/**
 * 统一错误处理中间件
 * - 捕获未处理异常
 * - 标准化错误响应格式
 * - 记录错误上下文信息
 */
app.use(errorHandler);

// ======================
// 全局事件监听
// ======================

/**
 * 启动 HTTP 服务
 * @param {number} port - 监听端口
 */
const hostname = process.env.HOST_NAME || "0.0.0.0";
const port = process.env.PORT || 3000;
app
  .listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
  })

  /**
   * 应用级错误事件监听
   * - 记录完整错误堆栈
   * - 关联请求追踪 ID
   * - 区分环境处理敏感信息
   */
  .on("error", (err, ctx) => {
    logger.error("应用异常", {
      httpCode: err.status || 500,
      routerPath: ctx.path,
      clientIp: ctx.ip, // 记录客户端 IP
      userAgent: ctx.header["user-agent"],
      message: err.message,
      errorStack: process.env.NODE_ENV === "production" ? undefined : err.stack, // 生产环境隐藏堆栈
      traceId: ctx.state.traceId,
      serviceVersion: process.env.npm_package_version,
    });
  });