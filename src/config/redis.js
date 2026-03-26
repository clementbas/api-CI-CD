import Redis from 'ioredis';

const redisEnabled = process.env.REDIS_ENABLED !== 'false';
const redisUrl = process.env.REDIS_URL;

let redis = null;

if (redisEnabled) {
    const hasHostConfig = process.env.REDIS_HOST || process.env.REDIS_PORT || process.env.REDIS_PASSWORD;

    const options = redisUrl
        ? redisUrl
        : {
            host: process.env.REDIS_HOST || '127.0.0.1',
            port: Number(process.env.REDIS_PORT || 6379),
            password: process.env.REDIS_PASSWORD || undefined,
            maxRetriesPerRequest: 1,
            enableOfflineQueue: false
        };

    if (process.env.NODE_ENV === 'production' && !redisUrl && !hasHostConfig) {
        console.warn('Redis disabled in production: missing REDIS_URL or REDIS_HOST/REDIS_PORT');
    } else {
        redis = new Redis(options);

        redis.on('connect', () => {
            console.log('Redis connected');
        });

        redis.on('error', (err) => {
            console.error('Redis connection error:', err.message);
        });
    }
}

if (!redisEnabled) {
    console.log('Redis disabled via REDIS_ENABLED=false');
}

export default redis;