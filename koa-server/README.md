# koa-server

写一个 koajs 最佳实践项目，支持 jwt 登录、注册、退出，等接口，保证一点的安全性、错误处理。数据库使用 MongoDB 和 Redis，日志存储在elasticsearch，图片存储在 chevereto
最后给我完整的nodejs20+代码

对所有的 http code 都使用koa 封装，给前端良好的返回格式和内容
日志存储和打印，格式为 时间 httpCode routerPath 具体内容已 JSON 格式展示

├── config              # 配置中心
├── controllers         # 业务逻辑
├── models              # 数据库模型
├── middleware          # 自定义中间件
├── routes              # 路由系统
├── utils               # 工具类
└── app.js              # 入口文件
└── package.json 