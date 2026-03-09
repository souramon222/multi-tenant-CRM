const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('mongo-sanitize');
const mongoose = require('mongoose');
const { sendResponse } = require('./utils/apiResponse');
const errorHandler = require('./middlewares/errorMiddleware');
const requestId = require('./middlewares/requestId');
const requestLogger = require('./middlewares/requestLogger');

const app = express();

// 1. Security Middlewares (Must be early)
app.use(helmet());

// Trust proxy for Render / hosted env
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : 'http://localhost:5173',
    credentials: true,
}));

// 2. Rate Limiting (Skip in test environment)
if (process.env.NODE_ENV !== 'test') {
    // Strict Auth Limiter
    const strictAuthLimiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 50,
        standardHeaders: true,
        legacyHeaders: false,
        message: 'Too many authentication attempts. Try again later.'
    });
    app.use('/api/v1/auth', strictAuthLimiter);

    // Global API Limiter
    const globalLimiter = rateLimit({
        windowMs: 10 * 60 * 1000, // 10 minutes
        max: 500,
        standardHeaders: true,
        legacyHeaders: false
    });
    app.use('/api', globalLimiter);
}

// 3. Trace & Log Middlewares
app.use(requestId);
app.use(requestLogger);

// Body parser & cookies
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use((req, res, next) => {
    if (req.body) req.body = mongoSanitize(req.body);
    if (req.query) req.query = mongoSanitize(req.query);
    next();
});

app.get('/favicon.ico', (req, res) => res.status(204).end());

// ---------------- HEALTH CHECK ----------------
app.get('/health', (req, res) => {
    const dbState = mongoose.connection.readyState;

    const status = dbState === 1 ? 'OK' : 'ERROR';

    res.status(dbState === 1 ? 200 : 500).json({
        status,
        database: dbState === 1 ? 'connected' : 'disconnected',
        uptime: process.uptime(),
        timestamp: Date.now(),
        environment: process.env.NODE_ENV
    });
});

app.get("/", (req, res) => {
  res.json({ message: "Multi-Tenant CRM API running" });
});

// Route files
const authRoutes = require('./routes/auth');
const superadminRoutes = require('./routes/superadmin');
const adminRoutes = require('./routes/admin');
const employeeRoutes = require('./routes/employee');
const customerRoutes = require('./routes/customer');
const { verifyCsrf } = require('./middlewares/csrf');

// Auth routes — no CSRF (token is issued on login/register)
app.use('/api/v1/auth', authRoutes);

// Protected routes — CSRF verified on POST/PUT/DELETE
app.use('/api/v1/superadmin', verifyCsrf, superadminRoutes);
app.use('/api/v1/admin', verifyCsrf, adminRoutes);
app.use('/api/v1/employee', verifyCsrf, employeeRoutes);
app.use('/api/v1/customers', verifyCsrf, customerRoutes);

app.use((req, res) => {
    sendResponse(res, 404, false, `Route ${req.originalUrl} not found`);  //route not found
});

// Error handler (Must be after routes)
app.use(errorHandler);

module.exports = app;
