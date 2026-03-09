import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, User, Mail, KeyRound, Building, ArrowRight, Sun, Moon, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

const RegisterCompany = () => {
    const [formData, setFormData] = useState({
        companyName: '',
        adminName: '',
        adminUsername: '',
        adminEmail: '',
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
            const res = await api.post('/auth/register-company', formData);
            const { data: userData } = res.data;

            login(userData);
            toast.success('Company registered successfully!');
            navigate('/admin');
        } catch (error) {
            const errorData = error.response?.data;
            if (errorData?.errors && Array.isArray(errorData.errors)) {
                // Show each validation error specifically
                errorData.errors.forEach(err => {
                    toast.error(err.message);
                });
            } else {
                toast.error(errorData?.message || 'Registration failed');
            }
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "block w-full pl-10 pr-3 py-2.5 border border-main rounded-md text-sm bg-input text-main placeholder-muted outline-none focus:border-primary transition-all";

    return (
        <div className="min-h-screen bg-main flex flex-col justify-center py-4 sm:py-8 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300">
            {/* Theme Toggle */}
            <div className="absolute top-6 right-6 z-50">
                <button
                    onClick={toggleTheme}
                    className="p-2.5 rounded-lg bg-card text-primary border border-main shadow-md hover:bg-primary-50 transition-all"
                >
                    {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                </button>
            </div>
            {/* Subtle background image */}
            <img
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000&auto=format&fit=crop"
                alt=""
                className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-[0.05] dark:opacity-[0.05]"
            />

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 animate-fade-in">
                <div className="flex justify-center">
                    <div className="bg-card p-2 rounded-md shadow-sm border border-main">
                        <Building2 className="h-6 w-6 text-primary" />
                    </div>
                </div>
                <h2 className="mt-2 text-center text-xl sm:text-2xl font-bold text-main">
                    Register your Company
                </h2>
                <p className="mt-0.5 text-center text-xs sm:text-sm text-muted">
                    Set up your workspace in minutes
                </p>
            </div>

            <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-lg relative z-10 animate-fade-in">
                <div className="bg-card py-5 px-5 shadow-md sm:rounded-lg sm:px-8 border border-main">
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium text-muted mb-1">Company Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Building className="h-4 w-4 text-muted" />
                                </div>
                                <input type="text" required className={inputClass} placeholder="Acme Corp" value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-muted mb-1">Admin Full Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-4 w-4 text-muted" /></div>
                                    <input type="text" required className={inputClass} placeholder="John Doe" value={formData.adminName} onChange={(e) => setFormData({ ...formData, adminName: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted mb-1">Admin Username</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-4 w-4 text-muted" /></div>
                                    <input type="text" required className={inputClass} placeholder="johndoe" value={formData.adminUsername} onChange={(e) => setFormData({ ...formData, adminUsername: e.target.value })} />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-muted mb-1">Admin Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-4 w-4 text-muted" /></div>
                                <input type="email" required className={inputClass} placeholder="admin@acmecorp.com" value={formData.adminEmail} onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-muted mb-1">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><KeyRound className="h-4 w-4 text-muted" /></div>
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
                            <div className="mt-2 space-y-1">
                                <p className="text-[10px] sm:text-xs text-muted flex items-center gap-1.5 px-1">
                                    <span className={`w-1 h-1 rounded-full ${formData.password.length >= 6 ? 'bg-primary' : 'bg-muted'}`} />
                                    At least 6 characters
                                </p>
                                <p className="text-[10px] sm:text-xs text-muted flex items-center gap-1.5 px-1">
                                    <span className={`w-1 h-1 rounded-full ${/\d/.test(formData.password) ? 'bg-primary' : 'bg-muted'}`} />
                                    At least one number
                                </p>
                                <p className="text-[10px] sm:text-xs text-muted flex items-center gap-1.5 px-1">
                                    <span className={`w-1 h-1 rounded-full ${/[A-Z]/.test(formData.password) ? 'bg-primary' : 'bg-muted'}`} />
                                    At least one uppercase letter
                                </p>
                            </div>
                        </div>

                        <div className="pt-1">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-hover w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-semibold text-white bg-primary hover:bg-primary-dark disabled:opacity-60 shadow-sm transition-all cursor-pointer"
                            >
                                {loading ? 'Registering...' : 'Create Account'}
                                {!loading && <ArrowRight className="w-4 h-4" />}
                            </button>
                        </div>
                    </form>

                    <div className="mt-3 text-center text-sm text-muted">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-primary hover:text-primary-dark transition-colors">
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterCompany;
