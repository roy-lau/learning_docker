import Redis from "ioredis";
import redisConfig from "../config/redis.js";

/**
 * Redis客户端封装类（单例模式）
 * 支持集群/单例模式自动识别，提供增强型操作和监控功能
 */
class RedisClient {
  static #instance = null; // 私有静态实例变量

  /**
   * 获取全局唯一实例
   * @param {Object|string} config - Redis配置对象或连接字符串
   * @returns {RedisClient} 单例实例
   */
  static getInstance(config) {
    if (!this.#instance) {
      this.#instance = new RedisClient(config);
    }
    return this.#instance;
  }

  /**
   * 私有化构造函数
   * @param {Object|string} config - Redis配置
   */
  constructor(config) {
    if (RedisClient.#instance) {
      throw new Error("请使用 getInstance() 方法获取实例");
    }

    // 统一配置选项
    const defaultOptions = {
      connectTimeout: 5000,    // 连接超时时间
      maxRetriesPerRequest: 3, // 最大重试次数
      enableReadyCheck: true   // 启用就绪检查
    };

    // 根据配置类型初始化客户端
    if (typeof config === "string") {
      // URI连接模式（示例：redis://:password@host:port/db）
      this.client = new Redis(config, {
        ...defaultOptions,
        retryStrategy: (times) => Math.min(times * 100, 3000) // 重试策略
      });
    } else if (Array.isArray(config.nodes)) {
      // 集群模式配置
      this.client = new Redis.Cluster(config.nodes, {
        ...defaultOptions,
        scaleReads: "slave",       // 从节点处理读请求
        slotsRefreshTimeout: 2000, // 分片刷新超时
        redisOptions: {
          password: config.password,
          enableAutoPipelining: true // 自动管道化提升性能
        }
      });
    } else {
      // 单实例配置
      this.client = new Redis({
        ...config,
        ...defaultOptions,
        enableOfflineQueue: false // 禁用离线队列防止内存泄漏
      });
    }

    this._initEvents(); // 初始化事件监听
  }

  /**
   * 初始化事件监听器
   */
  _initEvents() {
    // 错误事件处理
    this.client.on("error", (err) => {
      console.error(`[Redis错误] ${err.message}`);
    });

    // 连接就绪事件
    this.client.on("ready", () => {
      console.log("✅ Redis连接已建立");
      // 启用键过期通知（用于实现分布式锁自动释放）
      this.client.config("SET", "notify-keyspace-events", "Ex");
    });

    // 重连事件监听
    this.client.on("reconnecting", (delay) => {
      console.log(`⏳ Redis正在重连，预计等待 ${delay} 毫秒`);
    });
  }

  /* 基础操作命令封装 */

  /**
   * 获取键值
   * @param {string} key - 键名
   * @returns {Promise<string|null>} 键值或null
   */
  async get(key) {
    return this.client.get(key);
  }

  /**
   * 设置键值
   * @param {string} key - 键名
   * @param {string} value - 键值
   * @param {number} [ttl=0] - 过期时间（秒）
   * @returns {Promise<string>} 操作结果
   */
  async set(key, value, ttl = 0) {
    const args = ttl > 0 ? ["EX", ttl] : [];
    return this.client.set(key, value, ...args);
  }

  /**
   * 删除键
   * @param {...string} keys - 要删除的键名
   * @returns {Promise<number>} 删除的键数量
   */
  async del(...keys) {
    return this.client.del(keys);
  }

  /* 增强功能 */

  /**
   * 获取分布式锁
   * @param {string} key - 锁名称
   * @param {string} [value="1"] - 锁标识值
   * @param {number} [ttl=10] - 锁有效期（秒）
   * @returns {Promise<boolean>} 是否获取成功
   */
  async lock(key, value = "1", ttl = 10) {
    const result = await this.client.set(key, value, "NX", "EX", ttl);
    return result === "OK";
  }

  /**
   * 释放分布式锁
   * @param {string} key - 锁名称
   * @returns {Promise<number>} 删除结果
   */
  async unlock(key) {
    return this.client.del(key);
  }

  /**
   * 获取所有节点实例（集群模式专用）
   * @returns {Array} Redis节点实例列表
   */
  getNodes() {
    return this.client.nodes ? this.client.nodes("all") : [this.client];
  }

  /**
   * 关闭Redis连接
   * @returns {Promise<string>} 退出结果
   */
  async disconnect() {
    return this.client.quit();
  }
}

// 导出预配置实例
const redis = RedisClient.getInstance(redisConfig);
export default redis;

/**
 * @example1
 * import redis from './redis-client';

// 基础操作
await redis.set('config:app', JSON.stringify({ version: '2.0' }), 3600);
const data = await redis.get('config:app');

// 分布式锁应用
const lockKey = 'order:123';
if (await redis.lock(lockKey)) {
  try {
    // 业务处理...
  } finally {
    await redis.unlock(lockKey);
  }
}

 */