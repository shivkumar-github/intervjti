const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const Redis = require('ioredis');

const redisClient = new Redis(process.env.REDIS_URL);

const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,

    message: {
        success: false,
        message: 'Too many login attempts. Please try again later.'
    },

    store: new RedisStore({
        sendCommand: (command, ...args) =>
            redisClient.call(command, ...args)
    })
});

const otpRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,

    message: {
        success: false,
        message: 'Too many OTP requests. Please try again later.'
    },

    store: new RedisStore({
        sendCommand: (command, ...args) =>
            redisClient.call(command, ...args)
    })
});

const aiRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,

    message: {
        success: false,
        message: 'Too many AI requests. Please try again later.'
    },

    store: new RedisStore({
        sendCommand: (command, ...args) =>
            redisClient.call(command, ...args)
    })
});

module.exports = {
    loginRateLimiter,
    otpRateLimiter,
    aiRateLimiter
};