# learning_docker

> 学习 docker

## 命令行
```bash
# 启动
docker compose up
# 后台启动
docker compose up -d
# 关闭
docker compose down -v
```


## docker 文档

- [下载](https://docs.docker.com/get-docker/)

- dockerfile 配置 https://docs.docker.com/reference/dockerfile/

- docker compose file 配置 https://docs.docker.com/compose/compose-file/

- docker compose 导入其他 docker 配置 https://docs.docker.com/compose/multiple-compose-files/include/

- vuejs demo https://github.com/docker/awesome-compose/blob/master/vuejs/compose.yaml

## 待办文档

- elasticsearch https://www.elastic.co/cn/elasticsearch
  - https://www.elastic.co/guide/en/elasticsearch/reference/8.15/docker.html#docker-compose-file


我是个人开发者，只有一台服务器，我想将以下信息都放在一台服务器上。
主要需求是：生成 docker-compose 配置，最佳实践。账号密码都统一使用环境变量
配置要求有：
  Kibana 查看 Elasticsearch，使用 openresty 反向代理 Kibana
  Elasticsearch 持久化
  openresty 代理镜像中的所有服务，openresty 的日志也存在 Elasticsearch
  数据库 需要支持 MongoDB MySQL Redis 持久化，都使用 openresty 反向代理。数据库日志也存在Elasticsearch 可以使用 Kibana 查看
  Chevereto 搭配 MySQL 数据库，openresty 反向代理
  server用 koa 日志写入 Elasticsearch，koa 要能链接通 MongoDB MySQL Redis，koa 将图片存到Chevereto，koa 镜像要有稳定版的 nodejs
  还有前端代码用 vue3 写，打包后放在 openresty 下，开发时也使用 openresty反向代理