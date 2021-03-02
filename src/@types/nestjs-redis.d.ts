import { RedisService } from 'nestjs-redis';

declare module 'nestjs-redis/dist/redis.service' {
  interface RedisService {
    hmsetByObject: (obj: any) => string[];
  }
}
