import React, { useContext, useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, LayoutDashboard, Clock, Calendar, Building2, ChevronLeft, ChevronRight, Sun, Moon, Rocket, Menu, X } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';

const MiniCalendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const today = new Date();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthName = currentDate.toLocaleString('default', { month: 'long' });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const isToday = (day) => day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

    return (
        <div className="px-3">
            <div className="bg-primary-50 rounded-lg p-3 border border-main">
                <div className="flex items-center justify-between mb-2">
                    <button onClick={prevMonth} className="p-0.5 rounded hover:bg-card text-muted hover:text-primary transition-colors"><ChevronLeft size={14} /></button>
                    <span className="text-xs font-semibold text-main">{monthName} {year}</span>
                    <button onClick={nextMonth} className="p-0.5 rounded hover:bg-card text-muted hover:text-primary transition-colors"><ChevronRight size={14} /></button>
                </div>
                <div className="grid grid-cols-7 gap-0.5 text-center">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                        <div key={i} className="text-[9px] font-semibold text-muted py-0.5">{d}</div>
                    ))}
                    {days.map((day, i) => (
                        <div key={i} className={`text-[10px] py-1 rounded transition-all ${day === null ? '' :
                            isToday(day) ? 'bg-primary text-white font-bold' :
                                'text-main opacity-80 hover:bg-card cursor-default'
                            }`}>
                            {day || ''}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const LiveClock = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const timeStr = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const dateStr = time.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

    return (
        <div className="px-3">
            <div className="bg-primary-50 rounded-lg p-3 border border-main text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Clock size={12} className="text-primary" />
                    <span className="text-lg font-bold text-main tracking-tight">{timeStr}</span>
                </div>
                <p className="text-[10px] text-muted font-medium">{dateStr}</p>
            </div>
        </div>
    );
};

const Layout = () => {
    const { user, logout } = useContext(AuthContext);
    const { theme, toggleTheme } = useContext(ThemeContext);
    const navigate = useNavigate();

    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        logout();
        navigate('/login');
    };

    const cancelLogout = () => {
        setShowLogoutConfirm(false);
    };

    const companyName = user?.company?.name;
    const showCompany = user?.role === 'admin' || user?.role === 'employee';

    return (
        <div className="flex h-screen bg-main flex-row font-sans transition-colors duration-300">

            {/* Mobile Sidebar Backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-72 bg-sidebar border-r border-main flex flex-col shadow-2xl
                transform transition-transform duration-300 ease-in-out
                md:relative md:translate-x-0 md:w-64 md:shadow-none
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Logo & Mobile Close */}
                <div className="h-14 flex items-center justify-between px-5 border-b border-main shrink-0">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="bg-primary p-1 rounded-md shadow-sm">
                            <Rocket className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-lg font-bold text-primary tracking-wide">LeadOrbit</span>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="md:hidden p-1.5 rounded-lg text-muted hover:text-main hover:bg-primary-50 transition-colors cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Company Name */}
                {showCompany && companyName && (
                    <div className="px-4 py-3 border-b border-main">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-md bg-primary-50 flex items-center justify-center">
                                <Building2 size={13} className="text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] text-muted uppercase tracking-widest font-medium leading-none">Company</p>
                                <p className="text-xs font-semibold text-main truncate mt-0.5">{companyName}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Nav */}
                {user?.role === 'superadmin' && (
                    <div className="p-3">
                        <p className="text-[9px] text-muted uppercase tracking-widest font-semibold px-3 mb-2">Navigation</p>
                        <div className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md bg-primary-50 text-primary border border-primary-light">
                            <LayoutDashboard size={17} />
                            Dashboard
                        </div>
                    </div>
                )}

                {/* Clock & Calendar */}
                <div className="flex-1 overflow-y-auto space-y-3 py-2">
                    <div>
                        <p className="text-[9px] text-muted uppercase tracking-widest font-semibold px-6 mb-2">Today</p>
                        <LiveClock />
                    </div>
                    <div>
                        <p className="text-[9px] text-muted uppercase tracking-widest font-semibold px-6 mb-2">Calendar</p>
                        <MiniCalendar />
                    </div>
                </div>

                {/* User & Logout */}
                <div className="p-4 border-t border-main shrink-0">
                    <div className="flex items-center gap-3 mb-3 px-1">
                        <div className="w-8 h-8 rounded-md bg-primary-50 dark:bg-slate-800 flex items-center justify-center text-primary font-bold text-sm border border-primary-light dark:border-slate-700">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-main truncate">{user?.name}</p>
                            <p className="text-xs text-muted capitalize truncate">{user?.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogoutClick}
                        className="btn-hover w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-muted bg-input rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors border border-main cursor-pointer"
                    >
                        <LogOut size={15} />
                        Sign out
                    </button>
                </div>
            </aside>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={cancelLogout}></div>
                    <div className="relative bg-card rounded-2xl shadow-2xl p-7 w-full max-w-sm border border-main animate-slide-up transform transition-all duration-300">
                        <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5 border border-red-100 dark:border-red-800">
                            <LogOut size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-main text-center mb-2">Signing Out?</h3>
                        <p className="text-sm text-muted text-center mb-8 px-2 leading-relaxed">
                            Are you sure you want to log out of your <span className="text-primary font-semibold">{user?.name}</span> session?
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={confirmLogout}
                                className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-all shadow-lg shadow-red-500/20 hover:shadow-red-500/30 cursor-pointer"
                            >
                                Yes, Sign Out
                            </button>
                            <button
                                onClick={cancelLogout}
                                className="w-full py-3 bg-input text-main font-semibold rounded-lg border border-main hover:bg-primary-50 transition-all cursor-pointer"
                            >
                                No, Stay
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="h-14 bg-header border-b border-main flex items-center justify-between px-4 sm:px-6 shrink-0 shadow-sm transition-colors duration-300">
                    <div className="flex items-center gap-3">
                        {/* Hamburger Menu Button — mobile only */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="md:hidden p-2 rounded-lg text-muted hover:text-primary hover:bg-primary-50 transition-colors cursor-pointer"
                        >
                            <Menu size={20} />
                        </button>
                        <h1 className="text-sm font-semibold text-header capitalize tracking-wide">
                            {user?.role} Portal
                        </h1>
                        {showCompany && companyName && (
                            <span className="text-[10px] text-muted bg-primary-50 px-2 py-0.5 rounded border border-main font-medium hidden sm:inline">
                                {companyName}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg bg-primary-50 text-primary border border-primary-light hover:bg-primary-light transition-all duration-300 shadow-sm cursor-pointer"
                        title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                    >
                        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
