// utils/logger.js
import { createLogger, format, transports } from "winston";
import { ElasticsearchTransport } from "winston-elasticsearch";
import { Client } from "@elastic/elasticsearch"; // 使用官方 v8.x 客户端
import { fileURLToPath } from "url";
import { dirname } from "path";

// ES 模块兼容处理
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 创建 Elasticsearch 客户端实例
const esClient = new Client({
  node: process.env.ELASTICSEARCH_URL || "http://localhost:9200",
  auth: {
    username: process.env.ES_USER || "",
    password: process.env.ES_PASSWORD || "",
  },
  tls: {
    // 强化 TLS 配置
    rejectUnauthorized: process.env.NODE_ENV === "production",
    ca: process.env.ES_CA_CERT
      ? Buffer.from(process.env.ES_CA_CERT, "base64")
      : undefined,
  },
});

// Elasticsearch 传输配置
const esTransport = new ElasticsearchTransport({
  level: "info",
  client: esClient, // 使用预配置的客户端实例
  index: "applogs-{service.environment}-{+YYYY.MM.dd}",
  dataStream: true, // 启用 Data Stream 模式
  mappingTemplate: {
    template: {
      settings: {
        index: {
          lifecycle: {
            name: "applogs-policy",
            rollover_alias: "applogs",
          },
        },
      },
      mappings: {
        dynamic: false,
        properties: {
          "@timestamp": { type: "date" },
          message: { type: "wildcard" },
          service: {
            properties: {
              name: { type: "keyword" },
              version: { type: "keyword" },
              environment: { type: "keyword" },
            },
          },
        },
      },
    },
  },
});

// 增强日志格式配置
const jsonFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }), // 时间格式化
  format.errors({ stack: true }),
  format.metadata({ fillExcept: ["message", "level", "timestamp"] }),
  format.json()
);

// 创建日志实例
const logger = createLogger({
  format: jsonFormat,
  exceptionHandlers: [
    new transports.File({ filename: `${__dirname}/../logs/exceptions.log` }),
    esTransport,
  ],
  rejectionHandlers: [
    new transports.File({ filename: `${__dirname}/../logs/rejections.log` }),
    esTransport,
  ],
});

// 日志存储到本地，文件轮转（按日期和大小分割）
logger.add(
  new transports.File({
    filename: `${__dirname}/../logs/app.log`,
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "30d",
    format: format.combine(format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }), format.json()),
  })
);

// 开发环境日志打印到控制台
if (process.env.NODE_ENV === "development") {
  logger.add(
    new transports.Console({
      format: format.prettyPrint({ depth: 3, colorize: true }),
    })
  );
}

// 日志存储到Elasticsearch
logger.add(esTransport);

// 健康检查（使用顶层 await）
setInterval(async () => {
  try {
    const health = await esClient.cluster.health();
    logger.info("Elasticsearch cluster health", {
      status: health.status,
      nodeCount: health.number_of_nodes,
    });
  } catch (err) {
    logger.error("Elasticsearch 链接失败", { error: err.message });
  }
}, 300_000);

export default logger;
