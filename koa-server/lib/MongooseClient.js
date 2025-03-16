import mongoose from "mongoose";
import config from "../config/mongoose.js";

/**
 * 增强版Mongoose客户端封装类
 */
export class MongooseClient {
  static instance = null; // 单例实例

  constructor() {
    if (MongooseClient.instance) {
      return MongooseClient.instance;
    }

    this.connection = null;
    this.models = new Map(); // 改用Map存储模型
    this._isConnecting = false;
    this.retryCount = 0;
    MongooseClient.instance = this;
  }

  /**
   * 获取单例实例
   */
  static getInstance() {
    if (!this.instance) {
      this.instance = new MongooseClient();
    }
    return this.instance;
  }

  /**
   * 初始化数据库连接（增强版）
   */
  async connect() {
    if (this.connection) return this.connection;
    if (this._isConnecting) {
      console.warn("MongoDB 连接正在进行中，请勿重复操作");
      return;
    }

    try {
      this._isConnecting = true;
      this.connection = await mongoose.connect(config.uri, {
        ...config.options,
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`💐 MongoDB 连接成功 ${config.uri}`);
      this.retryCount = 0; // 重置重试计数器
      this._registerEventListeners();
      return this.connection;
    } catch (err) {
      console.error(`MongoDB 连接失败: ${err.message}`);
      this._handleConnectionError(err);
    } finally {
      this._isConnecting = false;
    }
  }

  /**
   * 事件监听器（中文日志）
   */
  _registerEventListeners() {
    const conn = mongoose.connection;

    conn.on("error", (err) => {
      console.error("[MongoDB 错误]", err.message);
    });

    conn.on("disconnected", () => {
      console.log("MongoDB 连接已断开");
      this._reconnect();
    });

    conn.on("reconnected", () => {
      console.log("MongoDB 连接已恢复");
    });

    conn.on("connecting", () => {
      console.log("⏳ 正在建立MongoDB连接...");
    });
  }

  /**
   * 智能重连机制（带指数退避）
   */
  _reconnect() {
    const delay = Math.min(1000 * Math.pow(2, this.retryCount), 30000);
    this.retryCount++;

    console.log(`将在 ${delay} 毫秒后尝试第 ${this.retryCount} 次重连`);
    setTimeout(() => this.connect(), delay);
  }

  /**
   * 增强型模型注册
   * @param {String} name - 模型名称（强制小写）
   * @param {Schema} schema - Mongoose Schema
   */
  registerModel(name, schema) {
    const normalizedName = name.toLowerCase();
    if (this.models.has(normalizedName)) {
      console.warn(`模型 ${normalizedName} 已存在，跳过重复注册`);
      return;
    }

    try {
      this.models.set(normalizedName, mongoose.model(normalizedName, schema));
      console.log(`模型 ${normalizedName} 注册成功`);
      return this.getModel(name)
    } catch (err) {
      console.error(`模型注册失败: ${err.message}`);
    }
  }

  /**
   * 安全获取模型实例
   */
  getModel(name) {
    const model = this.models.get(name.toLowerCase());
    if (!model) {
      throw new Error(`未找到模型: ${name}`);
    }
    return model;
  }

  /**
   * 安全关闭连接（增强版）
   */
  async disconnect() {
    try {
      await mongoose.disconnect();
      console.log("MongoDB 连接已主动关闭");
      this.connection = null;
    } catch (err) {
      console.error("连接关闭失败:", err.message);
    }
  }

  /**
   * 连接状态检查
   */
  get status() {
    return mongoose.connection.readyState;
  }
}

const dbClient = MongooseClient.getInstance();

// 带错误处理的连接
dbClient.connect().catch((err) => {
  console.error("数据库启动失败:", err);
});

/**
 * 导出 Mongoose客户端封装类
 * @example
 * ```
    // 模型注册
    dbClient.registerModel('User', new mongoose.Schema({
      name: String,
      email: String
    }));

    // 安全获取模型
    try {
      const userModel = dbClient.getModel('user');
    } catch (err) {
      console.error(err.message);
    }
```
 */
export default dbClient;
