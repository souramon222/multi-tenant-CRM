import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, KeyRound, User, Building2, Sun, Moon, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

const EmployeeLogin = () => {
    const [formData, setFormData] = useState({
        companyId: '',
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);
    const { theme, toggleTheme } = useContext(ThemeContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Send companyId as well for validation
            const res = await api.post('/auth/login', formData);
            const { data: userData } = res.data;

            if (userData.role !== 'employee') {
                toast.error('This login is for employees only. Please use the Admin login.');
                return;
            }

            login(userData);
            toast.success(`Welcome back, ${userData.name}!`);
            navigate('/employee');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-main flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300">
            {/* Theme Toggle */}
            <div className="absolute top-6 right-6 z-50">
                <button
                    onClick={toggleTheme}
                    className="p-2.5 rounded-lg bg-card text-primary border border-main shadow-md hover:bg-primary-50 transition-all"
                >
                    {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                </button>
            </div>
            <img
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000&auto=format&fit=crop"
                alt=""
                className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-[0.05] dark:opacity-[0.05]"
            />

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 animate-fade-in">
                <div className="flex justify-center">
                    <div className="bg-card p-3 rounded-md shadow-sm border border-main">
                        <Building2 className="h-8 w-8 text-primary" />
                    </div>
                </div>
                <h2 className="mt-5 text-center text-2xl font-bold text-main">
                    Employee Portal
                </h2>
                <p className="mt-1 text-center text-sm text-muted">
                    Access your assigned workspace and customers
                </p>
            </div>

            <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10 animate-fade-in">
                <div className="bg-card py-7 px-5 shadow-md sm:rounded-lg sm:px-8 border border-main">
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium text-muted mb-1">Company ID</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Building2 className="h-4 w-4 text-muted" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    className="block w-full pl-10 pr-3 py-2.5 border border-main rounded-md text-sm bg-input text-main placeholder-muted outline-none focus:border-primary transition-all"
                                    placeholder="e.g. CO-XXXXXXXXX"
                                    value={formData.companyId}
                                    onChange={(e) => setFormData({ ...formData, companyId: e.target.value.toUpperCase() })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-muted mb-1">Username</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-4 w-4 text-muted" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    className="block w-full pl-10 pr-3 py-2.5 border border-main rounded-md text-sm bg-input text-main placeholder-muted outline-none focus:border-primary transition-all"
                                    placeholder="Enter your username"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-muted mb-1">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <KeyRound className="h-4 w-4 text-muted" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    className="block w-full pl-10 pr-10 py-2.5 border border-main rounded-md text-sm bg-input text-main placeholder-muted outline-none focus:border-primary transition-all"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted hover:text-primary transition-colors cursor-pointer"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-hover w-full flex items-center justify-center gap-2 mt-2 py-2.5 px-4 rounded-md text-sm font-semibold text-white bg-primary hover:bg-primary-dark disabled:opacity-60 shadow-sm transition-all cursor-pointer"
                        >
                            {loading ? 'Entering Portal...' : 'Enter Employee Portal'}
                            {!loading && <LogIn className="w-4 h-4" />}
                        </button>
                    </form>

                    <div className="mt-5 text-center text-sm text-muted">
                        Registration issues?{' '}
                        <Link to="/login" className="font-medium text-primary hover:text-primary-dark transition-colors">
                            Back to Admin Login
                        </Link>
                    </div>
                </div>

                <p className="mt-6 text-center text-xs text-gray-400">
                    LeadOrbit SaaS • v1.0 • Professional CRM
                </p>
            </div>
        </div>
    );
};

export default EmployeeLogin;
