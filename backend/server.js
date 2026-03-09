if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const mongoose = require('mongoose');
const logger = require('./config/logger');
const connectDB = require('./config/db');
const app = require('./app');

const PORT = process.env.PORT || 5001;

let server;
let isShuttingDown = false;

//Graceful shutdown handler

const shutdown = async (signal) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.info({ signal }, 'Graceful shutdown initiated');

    if (server) {
        server.close(async () => {
            logger.info('Server closed');
            try {
                await mongoose.connection.close();
                logger.info('DB connection closed');
            } catch (err) {
                logger.error({ err }, 'Error closing DB connection');
            }
            process.exit(0);
        });
    } else {
        process.exit(0);
    }

    // Force exit if server doesn't close
    setTimeout(() => {
        logger.warn('Graceful shutdown timed out, forcing exit');
        process.exit(1);
    }, 10000).unref();
};

//Start server after DB connection

connectDB()
    .then(() => {
        logger.info('Database connected successfully');

        server = app.listen(PORT, () => {
            logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
        });

        // socket inactivity timeout
        server.setTimeout(30000);
    })
    .catch((err) => {
        logger.fatal({ err }, 'Database connection failed');
        process.exit(1);
    });

//System signals

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
process.on('SIGQUIT', shutdown);

//Unhandled promise rejection

process.on('unhandledRejection', (err) => {
    logger.fatal({ err }, 'Unhandled Promise Rejection');
    shutdown('unhandledRejection');
});

//Uncaught exception

process.on('uncaughtException', (err) => {
    try { logger.fatal({ err }, 'Uncaught Exception'); }
    catch { console.error('Uncaught Exception:', err); }

    setTimeout(() => process.exit(1), 500).unref();
});
