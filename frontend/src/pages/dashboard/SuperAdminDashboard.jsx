import React, { useEffect, useState } from 'react';
import { Building2, Archive, ShieldCheck, ShieldBan, Users, UserCog, Search, CalendarDays } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const SuperAdminDashboard = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const res = await api.get('/superadmin/companies');
            setCompanies(res.data.data || []);
        } catch {
            toast.error('Failed to load dashboard data');
        } finally { setLoading(false); }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to archive "${name}"? Users will no longer be able to log in.`)) return;
        try {
            await api.delete(`/superadmin/companies/${id}`);
            toast.success('Company archived successfully');
            fetchData();
        } catch { toast.error('Failed to archive company'); }
    };

    const handleToggleStatus = async (id) => {
        try {
            const res = await api.put(`/superadmin/companies/${id}/toggle-status`);
            toast.success(res.data.message || 'Status updated');
            fetchData();
        } catch { toast.error('Failed to update status'); }
    };

    const filteredCompanies = companies
        .filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
        .filter(c => filter === 'all' || c.status === filter);

    const activeCount = companies.filter(c => c.status === 'active').length;
    const blockedCount = companies.filter(c => c.status === 'blocked').length;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-card rounded-xl p-4 sm:p-5 shadow-sm border border-main flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 sm:gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center shrink-0">
                        <Building2 size={20} className="text-primary" />
                    </div>
                    <div>
                        <p className="text-xl sm:text-2xl font-bold text-main">{companies.length}</p>
                        <p className="text-[10px] text-muted uppercase tracking-wider font-semibold">Total Companies</p>
                    </div>
                </div>
                <div className="bg-card rounded-xl p-4 sm:p-5 shadow-sm border border-main flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 sm:gap-4">
                    <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center shrink-0">
                        <ShieldCheck size={20} className="text-green-500" />
                    </div>
                    <div>
                        <p className="text-xl sm:text-2xl font-bold text-main">{activeCount}</p>
                        <p className="text-[10px] text-muted uppercase tracking-wider font-semibold">Active</p>
                    </div>
                </div>
                <div className="bg-card rounded-xl p-4 sm:p-5 shadow-sm border border-main flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 sm:gap-4">
                    <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0">
                        <ShieldBan size={20} className="text-red-400" />
                    </div>
                    <div>
                        <p className="text-xl sm:text-2xl font-bold text-main">{blockedCount}</p>
                        <p className="text-[10px] text-muted uppercase tracking-wider font-semibold">Blocked</p>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                    <input
                        type="text"
                        placeholder="Search companies..."
                        className="w-full pl-9 pr-4 py-2.5 text-sm border border-main rounded-lg bg-input text-main shadow-sm outline-none focus:border-primary transition-all"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-1 bg-card p-1 rounded-lg border border-main shelf shadow-sm">
                    {['all', 'active', 'blocked'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 text-xs font-bold rounded-md capitalize transition-all ${filter === f
                                ? 'bg-primary text-white shadow-sm'
                                : 'text-muted hover:text-primary hover:bg-primary-50'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Company Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredCompanies.map((company) => (
                    <div
                        key={company._id}
                        className={`bg-card rounded-md border overflow-hidden shadow-sm hover:shadow-md transition-shadow ${company.status === 'blocked' ? 'border-red-200 dark:border-red-900/50 opacity-90' : 'border-main'
                            }`}
                    >
                        {/* Card Header */}
                        <div className="px-5 pt-5 pb-4 flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-md flex items-center justify-center text-sm font-bold border border-main ${company.status === 'blocked'
                                    ? 'bg-red-50 dark:bg-red-900/20 text-red-500 border-red-100 dark:border-red-800'
                                    : 'bg-primary-50 text-primary border-primary-light dark:border-primary/20'
                                    }`}>
                                    {company.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-main truncate">{company.name}</h3>
                                    <div className="flex items-center gap-1 text-xs text-muted mt-0.5">
                                        <CalendarDays size={11} />
                                        {new Date(company.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                </div>
                            </div>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${company.status === 'active'
                                ? 'bg-green-50 text-green-600 border border-green-100 dark:bg-green-900/20 dark:border-green-800'
                                : 'bg-red-50 text-red-500 border border-red-100 dark:bg-red-900/20 dark:border-red-800'
                                }`}>
                                {company.status === 'active' ? <ShieldCheck size={10} /> : <ShieldBan size={10} />}
                                {company.status}
                            </span>
                        </div>

                        {/* Stats */}
                        <div className="px-5 pb-3 flex gap-4">
                            <div className="flex items-center gap-1.5 text-xs text-muted">
                                <UserCog size={13} className="text-primary" />
                                <span className="font-medium text-main">{company.adminCount}</span> Admin{company.adminCount !== 1 ? 's' : ''}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted">
                                <Users size={13} className="text-primary" />
                                <span className="font-medium text-main">{company.employeeCount}</span> Employee{company.employeeCount !== 1 ? 's' : ''}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 px-5 pb-4 pt-2 border-t border-main">
                            <button
                                onClick={() => handleToggleStatus(company._id)}
                                className={`btn-hover flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold ${company.status === 'active'
                                    ? 'bg-red-50 text-red-500 hover:bg-red-100 border border-red-100 dark:bg-red-900/20 dark:border-red-800'
                                    : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-100 dark:bg-green-900/20 dark:border-green-800'
                                    }`}
                            >
                                {company.status === 'active' ? <ShieldBan size={13} /> : <ShieldCheck size={13} />}
                                {company.status === 'active' ? 'Block' : 'Unblock'}
                            </button>
                            <button
                                onClick={() => handleDelete(company._id, company.name)}
                                className="btn-hover flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-input text-muted hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 border border-main"
                            >
                                <Archive size={13} />
                                Archive
                            </button>
                        </div>
                    </div>
                ))}

                {filteredCompanies.length === 0 && (
                    <div className="col-span-full py-14 text-center border border-dashed border-main rounded-md bg-card">
                        <Building2 size={32} className="mx-auto text-muted mb-2 opacity-50" />
                        <p className="text-main text-sm font-medium">No companies found</p>
                        <p className="text-muted text-xs mt-1">Try adjusting your search or filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
