import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export const useAdminDashboard = () => {
    const [employees, setEmployees] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [empRes, custRes, assignRes] = await Promise.all([
                api.get('/admin/employees'),
                api.get('/admin/customers'),
                api.get('/admin/assignments')
            ]);

            // Note: Standardized API responses now contain { success: true, data: [...] }
            setEmployees(empRes.data.success ? empRes.data.data : empRes.data);
            setCustomers(custRes.data.success ? custRes.data.data : custRes.data);
            setAssignments(assignRes.data.success ? assignRes.data.data : assignRes.data);
        } catch (error) {
            toast.error('Failed to load dashboard data');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const addEmployee = async (employeeData) => {
        try {
            const res = await api.post('/admin/employees', employeeData);
            if (res.data.success) {
                toast.success('Employee added successfully');
                fetchData();
                return true;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add employee');
        }
        return false;
    };

    const updateEmployee = async (id, employeeData) => {
        try {
            const res = await api.put(`/admin/employees/${id}`, employeeData);
            if (res.data.success) {
                toast.success('Employee updated');
                fetchData();
                return true;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update employee');
        }
        return false;
    };

    const deleteEmployee = async (id) => {
        if (!window.confirm('Delete this employee?')) return;
        try {
            await api.delete(`/admin/employees/${id}`);
            toast.success('Employee deleted');
            fetchData();
        } catch {
            toast.error('Failed to delete employee');
        }
    };

    const addCustomer = async (customerData) => {
        try {
            const res = await api.post('/admin/customers', customerData);
            if (res.data.success) {
                const customer = res.data.data;

                // If an employee was selected, assign them
                if (customerData.employeeId) {
                    await api.post('/admin/assignments', {
                        employeeId: customerData.employeeId,
                        customerId: customer._id
                    });
                }

                toast.success('Customer added successfully');
                fetchData();
                return true;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add customer');
        }
        return false;
    };

    const updateCustomer = async (id, customerData) => {
        try {
            const res = await api.put(`/admin/customers/${id}`, customerData);
            if (res.data.success) {
                toast.success('Customer updated');
                fetchData();
                return true;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update customer');
        }
        return false;
    };

    const deleteCustomer = async (id) => {
        if (!window.confirm('Delete this customer?')) return;
        try {
            await api.delete(`/admin/customers/${id}`);
            toast.success('Customer deleted');
            fetchData();
        } catch {
            toast.error('Failed to delete customer');
        }
    };

    const assignCustomer = async (customerId, employeeId) => {
        try {
            const res = await api.put(`/admin/customers/${customerId}/assign`, { employeeId });
            if (res.data.success) {
                toast.success(res.data.message || 'Customer assigned successfully');
                fetchData();
                return true;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to assign customer');
        }
        return false;
    };

    return {
        employees,
        customers,
        assignments,
        loading,
        fetchData,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        assignCustomer
    };
};
