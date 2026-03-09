const express = require('express');
const rateLimit = require('express-rate-limit');
const { registerCompany, login, getMe, refreshToken, logoutUser } = require('../controllers/authController');
const { optionalProtect } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { registerValidation, loginValidation } = require('../middlewares/validationSchemas');
const { issueCsrfToken } = require('../middlewares/csrf');

const router = express.Router();

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

router.post('/register-company', registerValidation, validate, registerCompany);
router.post('/login', loginValidation, validate, login);
router.post('/refresh', authLimiter, refreshToken);
router.post('/logout', authLimiter, logoutUser);
router.get('/me', optionalProtect, getMe);
/* CSRF TOKEN ROUTE */
router.get('/csrf-token', issueCsrfToken);

module.exports = router;
