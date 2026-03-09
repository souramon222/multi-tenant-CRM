const express = require('express');
const { addActivity, getActivities, updateStatus } = require('../controllers/activityController');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roleCheck');
const { checkCustomerOwnership } = require('../middlewares/ownership');

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'employee'));

router.route('/:id/activities')
    .post(checkCustomerOwnership, addActivity)
    .get(checkCustomerOwnership, getActivities);

router.patch('/:id/status', checkCustomerOwnership, updateStatus);

module.exports = router;
