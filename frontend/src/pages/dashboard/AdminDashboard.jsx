import React, { useState, useContext } from 'react';
import { UserPlus, UserRoundPlus, Users, Building, Briefcase, ChevronRight } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';

// Components
import StatCard from '../../components/dashboard/StatCard';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import EmployeeTable from '../../components/dashboard/EmployeeTable';
import CustomerTable from '../../components/dashboard/CustomerTable';
import EditEmployeeModal from '../../components/dashboard/EditEmployeeModal';
import EditCustomerModal from '../../components/dashboard/EditCustomerModal';
import EmployeeDetailModal from '../../components/dashboard/EmployeeDetailModal';
import AssignEmployeeModal from '../../components/dashboard/AssignEmployeeModal';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const {
        employees, customers, assignments, loading,
        addEmployee, updateEmployee, deleteEmployee,
        addCustomer, updateCustomer, deleteCustomer, assignCustomer
    } = useAdminDashboard();

    const [activeTab, setActiveTab] = useState('overview');
    const [showId, setShowId] = useState(false);
    const [empSearch, setEmpSearch] = useState('');
    const [custSearch, setCustSearch] = useState('');

    // Form States
    const [empForm, setEmpForm] = useState({ name: '', username: '', email: '', password: '', serviceType: 'Full-time', experience: 0 });
    const [custForm, setCustForm] = useState({ name: '', email: '', phone: '', complaint: '', priority: 'Medium', employeeId: '' });

    // Modal/Selection States
    const [editingEmp, setEditingEmp] = useState(null);
    const [editingCust, setEditingCust] = useState(null);
    const [selectedEmp, setSelectedEmp] = useState(null);
    const [assigningCust, setAssigningCust] = useState(null);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );

    const filteredEmployees = employees.filter(e => e.name.toLowerCase().includes(empSearch.toLowerCase()));
    const filteredCustomers = customers.filter(c => c.name.toLowerCase().includes(custSearch.toLowerCase()));

    const handleAddEmployee = async (e) => {
        e.preventDefault();
        const success = await addEmployee(empForm);
        if (success) {
            setEmpForm({ name: '', username: '', email: '', password: '', serviceType: 'Full-time', experience: 0 });
            setActiveTab('overview');
        }
    };

    const handleUpdateEmployee = async (e) => {
        e.preventDefault();
        const success = await updateEmployee(editingEmp._id, editingEmp);
        if (success) setEditingEmp(null);
    };

    const handleAddCustomer = async (e) => {
        e.preventDefault();
        const success = await addCustomer(custForm);
        if (success) {
            setCustForm({ name: '', email: '', phone: '', complaint: '', priority: 'Medium', employeeId: '' });
            setActiveTab('overview');
        }
    };

    const handleUpdateCustomer = async (e) => {
        e.preventDefault();
        const success = await updateCustomer(editingCust._id, editingCust);
        if (success) setEditingCust(null);
    };

    const inputClass = "w-full text-sm border border-main rounded-md p-2.5 bg-input placeholder-gray-400 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all";

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <Briefcase size={15} /> },
        { id: 'add-employee', label: 'Add Employee', icon: <UserPlus size={15} /> },
        { id: 'add-customer', label: 'Add Customer', icon: <UserRoundPlus size={15} /> },
    ];

    return (
        <div className="max-w-7xl mx-auto pb-12 animate-fade-in">
            <DashboardHeader
                user={user}
                showId={showId}
                onToggleId={() => setShowId(!showId)}
            />

            {/* Tab Navigation */}
            <div className="flex items-center gap-1 mb-6 bg-card rounded-xl p-1 shadow-sm border border-main w-full sm:w-fit overflow-x-auto no-scrollbar">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex whitespace-nowrap items-center gap- cell px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all duration-200 flex-1 sm:flex-none justify-center ${activeTab === tab.id
                            ? 'bg-primary text-white shadow-md'
                            : 'text-muted hover:text-primary hover:bg-primary-50'
                            }`}
                    >
                        {tab.icon}
                        <span className="ml-2">{tab.label}</span>
                    </button>
                ))}
            </div>

            {activeTab === 'overview' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                        <StatCard
                            title="Total Employees"
                            value={employees.length}
                            subtext="Active team members"
                            icon={<Users />}
                            colorClass="text-primary"
                            bgColorClass="bg-primary-50 dark:bg-primary-900/20"
                            hoverBgColorClass="group-hover:bg-primary-light dark:group-hover:bg-primary-900/30"
                        />
                        <StatCard
                            title="Total Customers"
                            value={customers.length}
                            subtext="Managed accounts"
                            icon={<Building />}
                            colorClass="text-blue-500"
                            bgColorClass="bg-blue-50 dark:bg-blue-900/20"
                            hoverBgColorClass="group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30"
                        />
                        <StatCard
                            title="Assignments"
                            value={assignments.length}
                            subtext="Active connections"
                            icon={<Briefcase />}
                            colorClass="text-green-500"
                            bgColorClass="bg-green-50 dark:bg-green-900/20"
                            hoverBgColorClass="group-hover:bg-green-100 dark:group-hover:bg-green-900/30"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button onClick={() => setActiveTab('add-employee')} className="btn-hover flex items-center gap-3 bg-card rounded-lg p-4 shadow-sm border border-main hover:border-primary transition-all group text-left">
                            <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center group-hover:bg-primary-light dark:group-hover:bg-primary-900/30 transition-colors">
                                <UserPlus size={18} className="text-primary" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-main">Add New Employee</p>
                                <p className="text-xs text-muted">Onboard a new team member to your workspace</p>
                            </div>
                            <ChevronRight size={16} className="text-muted group-hover:text-primary transition-colors" />
                        </button>
                        <button onClick={() => setActiveTab('add-customer')} className="btn-hover flex items-center gap-3 bg-card rounded-lg p-4 shadow-sm border border-main hover:border-primary transition-all group text-left">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                                <UserRoundPlus size={18} className="text-blue-500" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-main">Add New Customer</p>
                                <p className="text-xs text-muted">Register a customer and assign them to an employee</p>
                            </div>
                            <ChevronRight size={16} className="text-muted group-hover:text-blue-50 transition-colors" />
                        </button>
                    </div>

                    <EmployeeTable
                        employees={filteredEmployees}
                        onSearch={setEmpSearch}
                        search={empSearch}
                        onView={setSelectedEmp}
                        onEdit={setEditingEmp}
                        onDelete={deleteEmployee}
                    />

                    <CustomerTable
                        customers={filteredCustomers}
                        assignments={assignments}
                        onSearch={setCustSearch}
                        search={custSearch}
                        onEdit={setEditingCust}
                        onDelete={deleteCustomer}
                        onEditAssignment={setAssigningCust}
                    />
                </div>
            )}

            {activeTab === 'add-employee' && (
                <div className="max-w-lg mx-auto animate-slide-up">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary-50 dark:bg-primary-900/20 mb-3">
                            <UserPlus size={26} className="text-primary" />
                        </div>
                        <h2 className="text-xl font-bold text-main">Add New Employee</h2>
                        <p className="text-sm text-muted mt-1">Fill in the details to onboard a new team member.</p>
                    </div>
                    <div className="bg-card rounded-lg p-6 shadow-sm border border-main">
                        <form className="space-y-4" onSubmit={handleAddEmployee}>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Full Name</label>
                                <input type="text" placeholder="e.g. John Doe" required className={inputClass} value={empForm.name} onChange={e => setEmpForm({ ...empForm, name: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Username</label>
                                    <input type="text" placeholder="johndoe" required className={inputClass} value={empForm.username} onChange={e => setEmpForm({ ...empForm, username: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Email</label>
                                    <input type="email" placeholder="john@company.com" required className={inputClass} value={empForm.email} onChange={e => setEmpForm({ ...empForm, email: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Login Password</label>
                                <input type="password" placeholder="••••••••" required className={inputClass} value={empForm.password} onChange={e => setEmpForm({ ...empForm, password: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Service Type</label>
                                    <select className={inputClass} value={empForm.serviceType} onChange={e => setEmpForm({ ...empForm, serviceType: e.target.value })}>
                                        <option value="Full-time">Full-time</option>
                                        <option value="Part-time">Part-time</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Experience (yrs)</label>
                                    <input type="number" min="0" placeholder="0" className={inputClass} value={empForm.experience} onChange={e => setEmpForm({ ...empForm, experience: e.target.value })} />
                                </div>
                            </div>
                            <button className="btn-hover w-full bg-primary text-white font-semibold text-sm py-3 rounded-lg hover:bg-primary-dark shadow-sm mt-2 transition-all">
                                Add Employee →
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {activeTab === 'add-customer' && (
                <div className="max-w-lg mx-auto animate-slide-up">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-blue-50 dark:bg-blue-900/20 mb-3">
                            <UserRoundPlus size={26} className="text-blue-500" />
                        </div>
                        <h2 className="text-xl font-bold text-main">Add New Customer</h2>
                        <p className="text-sm text-muted mt-1">Register a customer and optionally assign them to an employee.</p>
                    </div>
                    <div className="bg-card rounded-lg p-6 shadow-sm border border-main">
                        <form className="space-y-4" onSubmit={handleAddCustomer}>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Full Name</label>
                                <input type="text" placeholder="e.g. Jane Smith" required className={inputClass} value={custForm.name} onChange={e => setCustForm({ ...custForm, name: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Phone Number</label>
                                    <input type="tel" placeholder="+1 234 567 890" className={inputClass} value={custForm.phone} onChange={e => setCustForm({ ...custForm, phone: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Email</label>
                                    <input type="email" placeholder="jane@client.com" className={inputClass} value={custForm.email} onChange={e => setCustForm({ ...custForm, email: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Complaint / Issue</label>
                                <textarea placeholder="Describe the customer's issue or complaint..." rows={2} className={inputClass + " resize-none"} value={custForm.complaint} onChange={e => setCustForm({ ...custForm, complaint: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Priority</label>
                                    <select className={inputClass} value={custForm.priority} onChange={e => setCustForm({ ...custForm, priority: e.target.value })}>
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="Urgent">Urgent</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Assign to Employee</label>
                                    <select className={inputClass} value={custForm.employeeId} onChange={e => setCustForm({ ...custForm, employeeId: e.target.value })}>
                                        <option value="">— Assign later —</option>
                                        {employees.map(emp => (
                                            <option key={emp._id} value={emp._id}>{emp.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <button className="btn-hover w-full bg-primary text-white font-semibold text-sm py-3 rounded-lg hover:bg-primary-dark shadow-sm mt-2 transition-all">
                                Add Customer →
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <EditEmployeeModal
                isOpen={!!editingEmp}
                onClose={() => setEditingEmp(null)}
                employee={editingEmp}
                setEmployee={setEditingEmp}
                onUpdate={handleUpdateEmployee}
                inputClass={inputClass}
            />

            <EditCustomerModal
                isOpen={!!editingCust}
                onClose={() => setEditingCust(null)}
                customer={editingCust}
                setCustomer={setEditingCust}
                onUpdate={handleUpdateCustomer}
                inputClass={inputClass}
            />

            <EmployeeDetailModal
                isOpen={!!selectedEmp}
                onClose={() => setSelectedEmp(null)}
                employee={selectedEmp}
                assignments={assignments}
            />

            <AssignEmployeeModal
                isOpen={!!assigningCust}
                onClose={() => setAssigningCust(null)}
                customer={assigningCust}
                employees={employees}
                onAssign={assignCustomer}
            />
        </div>
    );
};

export default AdminDashboard;
