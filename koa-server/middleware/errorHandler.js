import logger from "../utils/logger.js"


export const errorHandler = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    // 记录错误日志到ES
    logger.error({
      timestamp: new Date().toISOString(),
      httpCode: err.status || 500,
      routerPath: ctx.path,
      message: err.message,
      errorStack: process.env.NODE_ENV === "production" ? undefined : err.stack,
      traceId: ctx.state.traceId,
    });

    ctx.status = err.statusCode || 500;
    ctx.body = {
      error:
        process.env.NODE_ENV === "production"
          ? "Internal Server Error"
          : err.message,
    };
  }
};
