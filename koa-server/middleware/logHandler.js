import logger from "../utils/logger.js"

export const logHandler = async (ctx, next) => {
  const _path = ctx._matchedRoute || ctx.path
  const start = Date.now();
  await next();
  const responseTime = Date.now() - start;

  const logEntry = {
    traceId: ctx.state.traceId,
    requestBody: ctx.request.body,
    responseBody: ctx.response.body || ctx.response.message,
    ip: ctx.ip,
    userAgent: ctx.headers["user-agent"],
  };

  // 写入日志系统
  logger.info(`method=${ctx.method} httpCode=${ctx.status} time=${responseTime}ms API= ${_path}`, logEntry);

};
