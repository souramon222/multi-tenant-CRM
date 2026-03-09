import React from 'react';
import { Building, EyeOff, Eye, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const DashboardHeader = ({ user, showId, onToggleId }) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        if (!user?.company?.companyId) return;
        navigator.clipboard.writeText(user.company.companyId);
        setCopied(true);
        toast.success('Company ID copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="mb-6 sm:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-main">Admin Dashboard</h1>
                <div className="flex items-center gap-2 mt-2 group relative">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-card border border-main rounded-md shadow-sm">
                        <span className="text-[10px] text-muted font-semibold uppercase tracking-tight">Company ID:</span>
                        <span className={`text-xs font-mono font-medium transition-all duration-300 ${showId ? 'text-main blur-0' : 'text-gray-200 blur-[3px] select-none dark:text-slate-700'}`}>
                            {user?.company?.companyId || 'CO-N/A'}
                        </span>
                        <div className="flex items-center gap-0.5 ml-1 border-l border-main pl-1">
                            <button
                                onClick={onToggleId}
                                className="p-1 rounded-md hover:bg-primary-50 text-muted hover:text-primary transition-colors"
                                title={showId ? "Hide ID" : "Show ID"}
                            >
                                {showId ? <EyeOff size={11} /> : <Eye size={11} />}
                            </button>
                            <button
                                onClick={handleCopy}
                                className="p-1 rounded-md hover:bg-primary-50 text-muted hover:text-primary transition-colors"
                                title="Copy ID"
                            >
                                {copied ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
                            </button>
                        </div>
                    </div>
                    <p className="hidden sm:block text-[10px] text-muted ml-2 font-medium opacity-70">Share ID with employees to login</p>
                </div>
            </div>
            <div className="hidden lg:block text-right">
                <p className="text-xs text-gray-400 font-medium">Workspace Status</p>
                <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-xs font-semibold text-main">Active Node</span>
                </div>
            </div>
        </div>
    );
};

export default DashboardHeader;

