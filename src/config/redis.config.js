import Redis from "ioredis";

export const redis = new Redis({
     host: "127.0.0.1",
     port: 6379,
})

export const redisPublisher = new Redis();
export const redisSubscriber = new Redis();

redis.on('connect', () => { console.log('Redis connected') })
redis.on('error', (error) => { console.log('Redis Error', error) })

//export default redis;