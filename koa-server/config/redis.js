/**
 * Redis连接配置（支持单实例和集群）
 * 环境变量示例：
 * REDIS_HOST=127.0.0.1
 * REDIS_PORT=6379
 */
const isCluster = process.env.REDIS_CLUSTER === 'true';



// 单实例配置
const standaloneConfig = process.env.REDIS_URI || {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || '',
  db: 0
};

// 集群配置（如果启用）
const clusterConfig = {
  nodes: [
    { host: 'redis-node1', port: 7000 },
    { host: 'redis-node2', port: 7001 }
  ]
};

export default isCluster ? clusterConfig : standaloneConfig;
