const express = require('express');
const {
    addEmployee, getEmployees, updateEmployee, deleteEmployee, restoreEmployee,
    addCustomer, getCustomers, updateCustomer, deleteCustomer, restoreCustomer,
    assignEmployee, getAssignments, assignCustomerToEmployee
} = require('../controllers/adminController');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roleCheck');
const validate = require('../middlewares/validate');
const { employeeValidation, updateEmployeeValidation, customerValidation, updateCustomerValidation } = require('../middlewares/validationSchemas');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.route('/employees')
    .post(employeeValidation, validate, addEmployee)
    .get(getEmployees);

router.route('/employees/:id')
    .put(updateEmployeeValidation, validate, updateEmployee)
    .delete(deleteEmployee);

router.patch('/employees/:id/restore', restoreEmployee);

router.route('/customers')
    .post(customerValidation, validate, addCustomer)
    .get(getCustomers);

router.route('/customers/:id')
    .put(updateCustomerValidation, validate, updateCustomer)
    .delete(deleteCustomer);

router.patch('/customers/:id/restore', restoreCustomer);
router.put('/customers/:id/assign', assignCustomerToEmployee);

router.route('/assignments')
    .post(assignEmployee)
    .get(getAssignments);

module.exports = router;
