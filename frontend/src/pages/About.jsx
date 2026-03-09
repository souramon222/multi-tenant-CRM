import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Rocket,
    ShieldCheck,
    Users,
    Building2,
    ArrowRight,
    CheckCircle2,
    Lock,
    BarChart3,
    Zap,
    LayoutDashboard,
    ArrowLeft,
    Moon,
    Sun
} from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';
import { useContext } from 'react';

const About = () => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useContext(ThemeContext);


    const functionalities = [
        {
            icon: <Building2 className="w-6 h-6" />,
            title: "Multi-Company Management",
            description: "Easily manage multiple business entities from a single unified interface with complete data separation."
        },
        {
            icon: <ShieldCheck className="w-6 h-6" />,
            title: "Role-Based Access Control",
            description: "Granular permissions for SuperAdmins, Company Admins, and Employees to ensure data security."
        },
        {
            icon: <Users className="w-6 h-6" />,
            title: "Employee Management",
            description: "Streamline your workforce with dedicated profiles, role assignments, and activity tracking."
        },
        {
            icon: <Users className="w-6 h-6" />,
            title: "Customer CRM",
            description: "Maintain a central repository of customer interactions, history, and preferences for better relationships."
        },
        {
            icon: <CheckCircle2 className="w-6 h-6" />,
            title: "Task & Assignment Tracking",
            description: "Assign duties to team members and monitor progress in real-time with automatic status updates."
        },
        {
            icon: <BarChart3 className="w-6 h-6" />,
            title: "Activity Logging",
            description: "Comprehensive audit trails of all system actions for transparency and accountability."
        },
        {
            icon: <Lock className="w-6 h-6" />,
            title: "Secure JWT Authentication",
            description: "Industry-standard security protocols to keep your business data private and protected."
        },
        {
            icon: <Zap className="w-6 h-6" />,
            title: "Data Isolation",
            description: "State-of-the-art multi-tenant architecture ensuring your company's data is never visible to others."
        }
    ];

    const steps = [
        { title: "Register Company", description: "Create your company account and set up your organizational profile." },
        { title: "Dashboard Access", description: "Get instant access to your specialized admin control panel." },
        { title: "Add Employees", description: "Invite your team members and assign them specific roles and permissions." },
        { title: "Manage Customers", description: "Import or create customer records to start building your CRM database." },
        { title: "Assign Tasks", description: "Distribute workload efficiently by assigning specific tasks to your employees." },
        { title: "Track Activities", description: "Monitor progress and system logs to maintain full operational visibility." }
    ];

    return (
        <div className="min-h-screen bg-main font-poppins transition-colors duration-300 pb-20">
            {/* Navigation Header */}
            <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-main px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="bg-primary p-1.5 rounded-lg">
                            <Rocket className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-main tracking-tight">LeadOrbit</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 text-sm font-medium text-muted hover:text-primary transition-colors cursor-pointer"
                        >
                            <ArrowLeft size={16} /> Back to Home
                        </button>
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg bg-primary-50 text-primary border border-primary-light hover:bg-primary-light transition-all duration-300 shadow-sm cursor-pointer"
                            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                        >
                            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* 1. Hero Section */}
            <section className="relative pt-20 pb-16 px-6 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-linear-to-b from-primary/10 to-transparent blur-3xl -z-10 opacity-60"></div>
                <div className="max-w-4xl mx-auto text-center animate-fade-in">
                    <div className="inline-flex items-center gap-2 bg-primary-50 px-3 py-1 rounded-full mb-6 border border-primary/20">
                        <Zap className="w-4 h-4 text-primary" />
                        <span className="text-primary font-bold text-[11px] uppercase tracking-wider">The Future of CRM</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-main mb-8 leading-[1.1] tracking-tight">
                        Empowering Growth Through <span className="text-primary text-wrap">Precision Management</span>
                    </h1>
                    <p className="text-lg text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
                        LeadOrbit is the comprehensive multi-tenant SaaS platform designed to streamline operations for modern businesses. From team orchestration to customer intelligence, we provide the tools you need to scale efficiently.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <button
                            onClick={() => navigate('/register')}
                            className="px-8 py-4 bg-primary text-white rounded-xl font-bold shadow-lg hover:bg-primary-dark hover:scale-105 transition-all duration-300 flex items-center gap-2"
                        >
                            Get Started Free <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </section>

            {/* 2. Platform Overview */}
            <section className="py-20 px-6 bg-card/50">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold text-main">Built for Every Stage of Your Business</h2>
                        <div className="space-y-4 text-muted leading-relaxed">
                            <p className="text-base sm:text-lg">
                                LeadOrbit was born from the need for a management system that balances power with simplicity. Unlike bloated legacy CRMs, LeadOrbit focus on what truly matters: your people and your customers.
                            </p>
                            <p className="text-base sm:text-lg">
                                Whether you're a lean startup, an ambitious SME, or a growing enterprise, our multi-tenant architecture provides a secure, isolated environment where you can manage your entire operation with surgical precision across all organizational levels.
                            </p>
                        </div>
                        <ul className="space-y-3">
                            {[
                                "Startups needing scale",
                                "SMEs streamlining operations",
                                "Enterprises requiring role-based security"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm font-medium text-main">
                                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <CheckCircle2 size={14} />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="relative">
                        <div className="absolute -inset-4 bg-primary/20 rounded-3xl blur-2xl opacity-30"></div>
                        <div className="relative bg-card border border-main rounded-2xl shadow-2xl overflow-hidden p-2">
                            <div className="bg-muted/5 rounded-xl aspect-video flex items-center justify-center border border-dashed border-main">
                                <LayoutDashboard className="w-16 h-16 text-muted/30" />
                                <span className="absolute text-muted/40 font-medium bottom-8">Platform Dashboard Preview</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Core Functionalities Grid */}
            <section className="py-24 px-6 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-main mb-4">Powerful Features, One Platform</h2>
                    <p className="text-muted max-w-xl mx-auto">Everything you need to orchestrate your business from top to bottom.</p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                    {functionalities.map((func, i) => (
                        <div key={i} className="group p-6 bg-card border border-main rounded-2xl shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300">
                            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary mb-5 group-hover:scale-110 transition-transform">
                                {func.icon}
                            </div>
                            <h3 className="font-bold text-main mb-3 group-hover:text-primary transition-colors">{func.title}</h3>
                            <p className="text-sm text-muted leading-relaxed">{func.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 4. How It Works Section */}
            <section className="py-24 px-6 bg-primary-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-main mb-4">Getting Started is Simple</h2>
                        <p className="text-muted">Launch your company portal in minutes, not days.</p>
                    </div>
                    <div className="relative grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-8">
                        {steps.map((step, i) => (
                            <div key={i} className="relative flex flex-col items-center text-center">
                                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg mb-4 z-10 shadow-md">
                                    {i + 1}
                                </div>
                                {i < steps.length - 1 && (
                                    <div className="hidden lg:block absolute top-6 left-[60%] w-[80%] h-[0.5] bg-primary/20 z-0"></div>
                                )}
                                <h4 className="font-bold text-main text-sm mb-2">{step.title}</h4>
                                <p className="text-xs text-muted leading-relaxed">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. Security & Rules Section */}
            <section className="py-24 px-6">
                <div className="max-w-5xl mx-auto bg-card border border-main rounded-3xl p-10 md:p-16 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <ShieldCheck size={200} />
                    </div>
                    <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center text-green-600 mb-6">
                                <Lock className="w-6 h-6" />
                            </div>
                            <h2 className="text-3xl font-bold text-main mb-6">Enterprise-Grade Security by Design</h2>
                            <p className="text-muted mb-8 leading-relaxed">
                                Security isn't an afterthought at LeadOrbit. We've built our architecture with data sovereignty as a core pillar.
                            </p>
                            <div className="space-y-4">
                                {[
                                    { title: "Strict Multi-Tenancy", text: "Physical and logical separation between company data." },
                                    { title: "Admin-Only Controls", text: "Sensitive actions restricted to authorized personnel." },
                                    { title: "Encrypted Data", text: "End-to-end security for all customer and employee records." }
                                ].map((rule, i) => (
                                    <div key={i} className="flex gap-4">
                                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                                        <div>
                                            <h5 className="font-bold text-main text-sm">{rule.title}</h5>
                                            <p className="text-xs text-muted">{rule.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-8 md:mt-0">
                            <div className="bg-main/50 p-5 sm:p-6 rounded-2xl border border-main text-center">
                                <Users className="w-8 h-8 text-primary mx-auto mb-3" />
                                <h6 className="font-bold text-[10px] uppercase tracking-wider text-muted font-sans">Access Control</h6>
                            </div>
                            <div className="bg-main/50 p-5 sm:p-6 rounded-2xl border border-main text-center">
                                <ShieldCheck className="w-8 h-8 text-primary mx-auto mb-3" />
                                <h6 className="font-bold text-[10px] uppercase tracking-wider text-muted font-sans">Data Isolation</h6>
                            </div>
                            <div className="bg-main/50 p-5 sm:p-6 rounded-2xl border border-main text-center">
                                <BarChart3 className="w-8 h-8 text-primary mx-auto mb-3" />
                                <h6 className="font-bold text-[10px] uppercase tracking-wider text-muted font-sans">Audit Logs</h6>
                            </div>
                            <div className="bg-main/50 p-5 sm:p-6 rounded-2xl border border-main text-center">
                                <Building2 className="w-8 h-8 text-primary mx-auto mb-3" />
                                <h6 className="font-bold text-[10px] uppercase tracking-wider text-muted font-sans">Ownership-Based</h6>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. Why Choose LeadOrbit */}
            <section className="py-24 px-6 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-main mb-4">Why Businesses Trust LeadOrbit</h2>
                </div>
                <div className="grid md:grid-cols-4 gap-8">
                    {[
                        { title: "Scalable Architecture", desc: "Grows with your team and customer base without performance lag." },
                        { title: "Modern UX/UI", desc: "Designed for joy and efficiency with no steep learning curve." },
                        { title: "Secure Multi-Tenancy", desc: "Rest easy knowing your data is locked away in your own vault." },
                        { title: "Built for Performance", desc: "Optimized MERN stack ensures lightning-fast interactions." }
                    ].map((feature, i) => (
                        <div key={i} className="text-center">
                            <div className="text-primary font-bold text-2xl mb-2">0{i + 1}</div>
                            <h4 className="font-bold text-main mb-3">{feature.title}</h4>
                            <p className="text-sm text-muted">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 7. Final CTA Section */}
            <section className="py-24 px-6">
                <div className="max-w-5xl mx-auto bg-primary rounded-[2.5rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-black/5 z-0"></div>
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h2 className="text-3xl md:text-5xl font-bold mb-8">Ready to take your business to the next orbit?</h2>
                        <p className="text-lg opacity-90 mb-10">
                            Join hundreds of companies that have already streamlined their management workflow.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <button
                                onClick={() => navigate('/register')}
                                className="px-10 py-4 bg-white text-primary rounded-xl font-bold shadow-xl hover:bg-muted-50 hover:scale-105 transition-all duration-300"
                            >
                                Start Managing Smarter
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
