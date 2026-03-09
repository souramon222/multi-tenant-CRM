const pino = require('pino');

const redactOptions = {
    paths: [
        'password',
        'passwordConfirm',
        'confirmPassword',
        'token',
        'accessToken',
        'refreshToken',
        'cookie',
        'cookies',
        'authorization',
        'headers.cookie',
        'headers.authorization',
    ],
    remove: true,
};

let logger;

if (process.env.NODE_ENV === 'test') {
    // Test environment: Standard JSON, silent by default, no transport initialization
    logger = pino({
        level: process.env.LOG_LEVEL || 'silent',
        redact: redactOptions,
        base: { env: 'test' },
        timestamp: pino.stdTimeFunctions.isoTime,
    });
} else if (process.env.NODE_ENV === 'development') {
    // Dev environment: Pretty logs
    logger = pino(
        {
            level: process.env.LOG_LEVEL || 'debug',
            redact: redactOptions,
            base: { env: 'development' },
            timestamp: pino.stdTimeFunctions.isoTime,
        },
        require('pino-pretty')({
            colorize: true,
            levelFirst: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
        })
    );
} else {
    // Production environment: Standard JSON logs
    logger = pino({
        level: process.env.LOG_LEVEL || 'info',
        redact: redactOptions,
        base: { env: 'production' },
        timestamp: pino.stdTimeFunctions.isoTime,
    });
}

module.exports = logger;
