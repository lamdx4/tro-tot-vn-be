import { ConfigService } from "@/services/config.service";
import Redis from "ioredis";

let redis: Redis | null = null;

function getRedis(): Redis {
  if (!redis) {
    redis = new Redis({
      port: Number(ConfigService.gI().getOrThrow("REDIS_PORT")),
      host: ConfigService.gI().getOrThrow("REDIS_HOST"),
      password: ConfigService.gI().getOrThrow("REDIS_PASSWORD"),
    });

    // Listen for successful connection
    redis.on('connect', () => {
      console.log('[Redis] Connected successfully');
    });

    // Listen for connection errors
    redis.on('error', (err) => {
      console.error('Redis connection error:', err);
    });
  }
  return redis;
}

export const redisClient = getRedis();