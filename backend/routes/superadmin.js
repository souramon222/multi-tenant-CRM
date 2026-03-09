const express = require('express');
const { getCompanies, deleteCompany, toggleCompanyStatus } = require('../controllers/superadminController');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roleCheck');

const router = express.Router();

router.use(protect);
router.use(authorize('superadmin'));

router.get('/companies', getCompanies);
router.delete('/companies/:id', deleteCompany);
router.put('/companies/:id/toggle-status', toggleCompanyStatus);

module.exports = router;
