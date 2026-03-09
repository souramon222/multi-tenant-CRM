import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Rocket, ShieldCheck, Users, Building2, ArrowRight, Sun, Moon } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';

const Landing = () => {

    const { theme, toggleTheme } = useContext(ThemeContext);

    return (
        <div className="min-h-screen bg-main overflow-x-hidden font-poppins transition-colors duration-300">
            {/* Theme Toggle Button */}
            <div className="absolute top-6 right-6 z-50">
                <button
                    onClick={toggleTheme}
                    className="p-3 rounded-xl bg-card text-primary border border-main shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group cursor-pointer"
                    title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                >
                    {theme === 'light' ? <Moon size={20} className="group-hover:rotate-12 transition-transform" /> : <Sun size={20} className="group-hover:rotate-90 transition-transform" />}
                </button>
            </div>

            {/* Top Left Logo */}
            <div className="absolute top-6 left-6 z-50 flex items-center gap-2">
                <div className="bg-primary p-1.5 rounded-lg shadow-sm">
                    <Rocket className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-main tracking-tight">LeadOrbit</span>
                <span className="text-primary font-bold tracking-wider uppercase text-[10px] bg-primary-50 px-2 py-1 rounded">v1.0</span>
            </div>

            {/* Main Container */}
            <div className="relative flex flex-col md:flex-row h-full md:h-screen">

                {/* Left Side: Content */}
                <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-20 z-20 bg-card pt-32 md:pt-40 lg:pt-32">
                    <div className="max-w-xl animate-fade-in text-center md:text-left mt-4 md:mt-0">
                        <h1 className="text-4xl sm:text-5xl lg:text-5xl font-bold text-main leading-tight mb-6 tracking-tight">
                            Orbit Your <span className="text-primary">Leads</span> <br className="hidden lg:block" /> Accelerate Your Growth.
                            <Link
                                to="/about"
                                className="inline-flex ml-3 align-middle px-3 py-1 text-[11px] font-bold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20 rounded-full transition-all duration-300 transform hover:scale-105"
                            >
                                Learn More
                            </Link>
                        </h1>

                        <p className="text-sm md:text-base text-muted mb-6 leading-relaxed max-w-lg mx-auto md:mx-0">
                            Transform the way you manage customers and teams with a powerful, modern CRM platform.
                            Track employees, organize customer interactions, and streamline operations — all in one clean, high-performance workspace.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
                            <Link
                                to="/register"
                                className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-xl font-bold text-base shadow-lg hover:bg-primary-dark transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                Get Started Free <ArrowRight className="w-4 h-4" />
                            </Link>

                            <Link
                                to="/login"
                                className="w-full sm:w-auto px-8 py-4 bg-card text-main border-2 border-main rounded-xl font-bold text-base hover:border-primary-light hover:bg-primary-50 transition-all duration-300 text-center"
                            >
                                Admin Login
                            </Link>
                        </div>

                        <div className="mt-8 pt-8 border-t border-main flex items-center justify-center md:justify-start gap-8">
                            <div className="flex flex-col">
                                <span className="text-xl font-bold text-main">10k+</span>
                                <span className="text-[10px] text-muted uppercase tracking-widest font-semibold">Leads Managed</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-bold text-main">500+</span>
                                <span className="text-[10px] text-muted uppercase tracking-widest font-semibold">Growing Companies Trust LeadOrbit</span>
                            </div>
                        </div>

                        <div className="mt-8">
                            <Link to="/employee-login" className="text-[14px] font-semibold hover:text-primary flex items-center justify-center md:justify-start gap-2 transition-colors w-full md:w-fit py-2">
                                <Users className="w-4 h-4" /> Are you an Employee? Enter portal
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Right Side: Image & Diagonal Split */}
                <div className="relative w-full md:w-1/2 h-125 md:h-full bg-input overflow-hidden">
                    {/* Diagonal Overlay */}
                    <div
                        className="absolute top-0 left-0 w-full h-full bg-card hidden md:block"
                        style={{
                            clipPath: 'polygon(0 0, 25% 0, 0 100%, 0% 100%)',
                            zIndex: 10
                        }}
                    ></div>

                    <div className="absolute inset-0 flex items-center justify-center p-12">
                        <div className="relative w-full max-w-2xl transform rotate-2 animate-float">
                            {/* Background Glow */}
                            <div className="absolute -inset-4 bg-linear-to-tr from-primary-light to-orange-200 dark:to-orange-900 rounded-3xl blur-2xl opacity-30"></div>

                            <img
                                src="/hero-bg.png"
                                alt="LeadOrbit Dashboard"
                                className="relative rounded-2xl shadow-2xl border-4 border-card object-cover w-full h-auto z-10"
                            />

                            {/* Floating Cards */}
                            <div className="absolute -top-6 -right-6 bg-card p-4 rounded-xl shadow-xl z-20 flex items-center gap-3 animate-pulse border border-main">
                                <div className="bg-green-100 dark:bg-green-900/40 p-2 rounded-lg text-green-600 dark:text-green-400">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted font-bold uppercase tracking-tighter">System Status</p>
                                    <p className="text-xs font-bold text-main">Operational</p>
                                </div>
                            </div>

                            <div className="absolute -bottom-6 -left-6 bg-card p-4 rounded-xl shadow-xl z-20 flex items-center gap-3 border border-main">
                                <div className="bg-orange-100 dark:bg-orange-900/40 p-2 rounded-lg text-orange-600 dark:text-orange-400">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted font-bold uppercase tracking-tighter">New Lead</p>
                                    <p className="text-xs font-bold text-main">+ High Priority</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Footer Decor */}
            <div className="md:hidden p-8 text-center text-muted text-sm italic">
                "The fastest way to grow your business"
            </div>
        </div>
    );
};

export default Landing;
