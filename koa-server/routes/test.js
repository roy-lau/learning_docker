import Router from "@koa/router";
const router = new Router();
import redis from "../lib/RedisClient.js";
import db from "../lib/MongooseClient.js";

// http://localhost/api/test/

router.get("/test", async (ctx) => {
  ctx.status = 200;
  ctx.body = {
    say: "hello",
  };
});

router.get("/health", async (ctx) => {
  const dbStatus = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
    99: "uninitialized",
  };
  // console.log("redis---",redis)
  ctx.body = {
    status: "UP",
    uptime: process.uptime(),
    db: dbStatus[db.status],
    redis: await redis.client.ping() === 'PONG'
  };
});

export default router;
