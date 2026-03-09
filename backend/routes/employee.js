const express = require('express');
const { getAssignedCustomers } = require('../controllers/employeeController');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roleCheck');

const router = express.Router();

router.use(protect);
router.use(authorize('employee'));

router.get('/assignments', getAssignedCustomers);

module.exports = router;
