import Redis from "ioredis";

let redisClient: Redis | null = null;

export function getRedisClient(): Redis | null {
  if (redisClient) return redisClient;

  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
  if (!redisUrl) return null;

  try {
    redisClient = new Redis(redisUrl);
    redisClient.on("error", (err) => {
      console.error("[redis] connection error:", err);
      redisClient = null;
    });
    return redisClient;
  } catch (e) {
    console.error("[redis] failed to create client:", e);
    return null;
  }
}
