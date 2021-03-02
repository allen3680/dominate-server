import { RedisService } from 'nestjs-redis';

RedisService.prototype.hmsetByObject = function(obj: any) {
  return Object.keys(obj)
    .map(key => {
      let value = obj[key];
      if (value instanceof Date) {
        value = value.format();
      }
      return [key, `${value}`];
    })
    .flat();
};
