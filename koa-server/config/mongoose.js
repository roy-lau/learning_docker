/**
 * MongoDB连接配置
 * 环境变量示例：
 * MONGODB_URI=mongodb://user:pass@host:port/db
 */
export default {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/koa-app',
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    bufferCommands: false  // 禁用缓冲命令
  }
};
