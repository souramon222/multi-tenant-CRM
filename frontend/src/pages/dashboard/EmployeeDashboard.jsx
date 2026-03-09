import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Users, Phone, Mail, MessageSquare, History, Send, X, AlertCircle, Clock, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const EmployeeDashboard = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [activities, setActivities] = useState([]);
    const [newNote, setNewNote] = useState('');
    const [updating, setUpdating] = useState(false);

    useEffect(() => { fetchCustomers(); }, []);

    const fetchCustomers = async () => {
        try {
            const res = await api.get('/employee/assignments');
            setCustomers(res.data.data || []);
        } catch { toast.error('Failed to load customers'); }
        finally { setLoading(false); }
    };

    const fetchActivities = async (id) => {
        try {
            const res = await api.get(`/customers/${id}/activities`);
            setActivities(res.data.data || []);
        } catch (error) {
            console.error('Failed to load timeline:', error);
            toast.error('Failed to load timeline');
        }
    };

    const handleManage = (cust) => {
        setSelectedCustomer(cust);
        fetchActivities(cust._id);
    };

    const handleUpdateStatus = async (payload) => {
        setUpdating(true);
        try {
            const res = await api.patch(`/customers/${selectedCustomer._id}/status`, payload);
            setSelectedCustomer(res.data.data);
            fetchCustomers();
            fetchActivities(selectedCustomer._id);
            toast.success('Updated successfully');
        } catch (error) {
            console.error('Update failed:', error);
            toast.error('Update failed');
        }
        finally { setUpdating(false); }
    };

    const handleAddNote = async (e) => {
        e.preventDefault();
        if (!newNote.trim()) return;
        try {
            await api.post(`/customers/${selectedCustomer._id}/activities`, { note: newNote });
            setNewNote('');
            fetchActivities(selectedCustomer._id);
            toast.success('Note added');
        } catch { toast.error('Failed to save note'); }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h2 className="text-xl font-bold text-main">Your Portfolio</h2>
                    <p className="text-muted text-sm mt-0.5">Manage and track your assigned customer interactions.</p>
                </div>
                <div className="bg-card rounded-md border border-main px-4 py-2 flex items-center gap-2 shadow-sm">
                    <Users size={16} className="text-primary" />
                    <span className="font-semibold text-main text-sm">{customers.length}</span>
                    <span className="text-muted text-xs">Assigned Customers</span>
                </div>
            </div>

            {/* Customer Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {customers.map((cust) => (
                    <div key={cust._id} className="bg-card rounded-xl p-5 shadow-sm border border-main hover:shadow-md transition-all flex flex-col group">
                        <div className="flex items-start justify-between gap-3 mb-4">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary flex items-center justify-center font-bold text-sm border border-main group-hover:bg-primary-light transition-colors">
                                    {(cust.name || 'CU').substring(0, 2).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-sm font-bold text-main truncate">{cust.name}</h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <div className={`w-1.5 h-1.5 rounded-full ${cust.priority === 'Urgent' ? 'bg-red-500 animate-pulse' :
                                            cust.priority === 'High' ? 'bg-orange-500' :
                                                cust.priority === 'Medium' ? 'bg-yellow-500' : 'bg-gray-300'
                                            }`}></div>
                                        <span className="text-[10px] font-semibold text-muted uppercase tracking-tighter">{cust.priority || 'Medium'} Priority</span>
                                    </div>
                                </div>
                            </div>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${cust.status === 'Resolved' || cust.status === 'Closed' ? 'bg-green-50 text-green-600 border-green-100 dark:bg-green-900/20 dark:border-green-800' :
                                cust.status === 'In Progress' ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800' :
                                    cust.status === 'On Hold' ? 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/20 dark:border-orange-800' :
                                        'bg-gray-50 text-gray-500 border-gray-100 dark:bg-slate-800 dark:border-slate-700'
                                }`}>
                                {cust.status || 'New'}
                            </span>
                        </div>

                        <div className="space-y-2.5 mb-5 flex-1">
                            {cust.email && (
                                <div className="flex items-center text-xs text-muted gap-2 group/item">
                                    <Mail size={13} className="text-muted opacity-50" />
                                    <span className="truncate">{cust.email}</span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigator.clipboard.writeText(cust.email);
                                            toast.success('Email copied');
                                        }}
                                        className="opacity-0 group-hover/item:opacity-100 p-1 hover:bg-primary-50 rounded transition-all"
                                    >
                                        <Copy size={10} />
                                    </button>
                                </div>
                            )}
                            {cust.phone && (
                                <div className="flex items-center text-xs text-muted gap-2 group/item">
                                    <Phone size={13} className="text-muted opacity-50" />
                                    <span>{cust.phone}</span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigator.clipboard.writeText(cust.phone);
                                            toast.success('Phone copied');
                                        }}
                                        className="opacity-0 group-hover/item:opacity-100 p-1 hover:bg-primary-50 rounded transition-all"
                                    >
                                        <Copy size={10} />
                                    </button>
                                </div>
                            )}
                            <div className="bg-input rounded-lg p-3 border border-main">
                                <div className="flex items-center gap-1.5 mb-1 text-muted opacity-50">
                                    <AlertCircle size={10} />
                                    <span className="text-[9px] font-bold uppercase tracking-wider">Complaint</span>
                                </div>
                                <p className="text-[11px] text-main line-clamp-2 leading-relaxed italic opacity-80">"{cust.complaint || 'No specified complaint provided.'}"</p>
                            </div>
                        </div>

                        <button
                            onClick={() => handleManage(cust)}
                            className="w-full py-2.5 bg-primary-50 text-primary text-xs font-bold rounded-lg border border-primary-light hover:bg-primary hover:text-white transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            <History size={14} /> Manage & Timeline
                        </button>
                    </div>
                ))}
                {customers.length === 0 && (
                    <div className="col-span-full py-14 text-center border border-dashed border-main rounded-xl bg-card">
                        <Users size={28} className="mx-auto text-muted mb-2 opacity-50" />
                        <p className="text-main text-sm font-medium">No customers assigned yet.</p>
                    </div>
                )}
            </div>

            {/* Management Modal */}
            {selectedCustomer && ReactDOM.createPortal(
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-100 p-4 sm:p-6 md:p-8 overflow-hidden" onClick={() => setSelectedCustomer(null)}>
                    <div className="bg-card rounded-2xl shadow-2xl w-full max-w-5xl h-[95vh] sm:h-[90vh] md:h-[80vh] overflow-hidden flex flex-col md:flex-row animate-scale-up border border-main" onClick={e => e.stopPropagation()}>

                        {/* Modal Left: Controls & Profile */}
                        <div className="w-full md:w-95 border-b md:border-b-0 md:border-r border-main p-5 sm:p-6 flex flex-col overflow-y-auto shrink-0 bg-card/50">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-14 h-14 rounded-xl bg-primary-50 text-primary flex items-center justify-center font-bold text-xl border border-main shadow-sm">
                                    {(selectedCustomer.name || 'CU').substring(0, 2).toUpperCase()}
                                </div>
                                <button onClick={() => setSelectedCustomer(null)} className="p-2 -mr-2 text-muted hover:text-main md:hidden transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-main">{selectedCustomer.name}</h3>
                                <p className="text-[10px] text-muted font-bold uppercase tracking-wider mt-1">ID: {selectedCustomer._id}</p>
                            </div>

                            <div className="space-y-6 mb-8">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">Workflow Status</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['Contacted', 'In Progress', 'On Hold', 'Resolved'].map(s => (
                                            <button
                                                key={s}
                                                disabled={updating}
                                                onClick={() => handleUpdateStatus({ status: s })}
                                                className={`py-2.5 text-[11px] font-bold rounded-lg border transition-all ${selectedCustomer.status === s
                                                    ? 'bg-primary text-white border-primary shadow-md'
                                                    : 'bg-card text-muted border-main hover:border-primary hover:bg-primary-50'
                                                    }`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Set Priority</label>
                                    <div className="flex gap-2">
                                        {['Low', 'Medium', 'High', 'Urgent'].map(p => (
                                            <button
                                                key={p}
                                                disabled={updating}
                                                onClick={() => handleUpdateStatus({ priority: p })}
                                                className={`flex-1 py-1.5 text-[10px] font-bold rounded-md border transition-all ${selectedCustomer.priority === p
                                                    ? 'bg-slate-800 dark:bg-slate-700 text-white border-slate-800 dark:border-slate-600'
                                                    : 'bg-card text-muted border-main hover:border-muted'
                                                    }`}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto space-y-3 pt-6 border-t border-main">
                                <div className="flex items-center justify-between text-sm group/contact">
                                    <div className="flex items-center gap-3">
                                        <Phone size={14} className="text-muted opacity-50" />
                                        <span className="text-main font-medium">{selectedCustomer.phone || 'No phone'}</span>
                                    </div>
                                    {selectedCustomer.phone && (
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(selectedCustomer.phone);
                                                toast.success('Phone copied');
                                            }}
                                            className="p-1.5 hover:bg-primary-50 rounded-md transition-colors text-muted hover:text-primary"
                                        >
                                            <Copy size={12} />
                                        </button>
                                    )}
                                </div>
                                <div className="flex items-center justify-between text-sm group/contact">
                                    <div className="flex items-center gap-3">
                                        <Mail size={14} className="text-muted opacity-50" />
                                        <span className="text-main font-medium">{selectedCustomer.email || 'No email'}</span>
                                    </div>
                                    {selectedCustomer.email && (
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(selectedCustomer.email);
                                                toast.success('Email copied');
                                            }}
                                            className="p-1.5 hover:bg-primary-50 rounded-md transition-colors text-muted hover:text-primary"
                                        >
                                            <Copy size={12} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Modal Right: Timeline */}
                        <div className="flex-1 bg-input flex flex-col min-h-0 overflow-hidden">
                            <div className="p-4 bg-card border-b border-main flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <History size={16} className="text-primary" />
                                    <h4 className="font-bold text-main text-sm italic">Activity Timeline</h4>
                                </div>
                                <button onClick={() => setSelectedCustomer(null)} className="hidden md:block text-muted hover:text-main">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Timeline Body */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {activities.map((act, i) => (
                                    <div key={act._id} className="relative flex gap-4">
                                        {/* Connector Line */}
                                        {i !== activities.length - 1 && (
                                            <div className="absolute left-2.75 top-6 -bottom-6 w-0.5 bg-gray-200"></div>
                                        )}

                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${act.type === 'System' ? 'bg-primary-light text-primary' : 'bg-main border border-main text-muted'
                                            }`}>
                                            {act.type === 'System' ? <AlertCircle size={12} /> : <MessageSquare size={12} />}
                                        </div>

                                        <div className="flex-1 bg-card p-3.5 rounded-xl border border-main shadow-sm">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-[10px] font-bold text-muted tracking-wider">
                                                    {act.type === 'System' ? 'SYSTEM UPDATE' : act.user?.name || 'User'}
                                                </span>
                                                <div className="flex items-center gap-1 text-[9px] text-muted opacity-50 font-medium">
                                                    <Clock size={8} />
                                                    {new Date(act.createdAt).toLocaleString()}
                                                </div>
                                            </div>
                                            <p className={`text-xs ${act.type === 'System' ? 'text-primary font-medium' : 'text-main'}`}>
                                                {act.note}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {activities.length === 0 && (
                                    <div className="text-center py-12 text-gray-300">
                                        <MessageSquare size={24} className="mx-auto mb-2 opacity-50" />
                                        <p className="text-xs font-medium">No activity logged yet.</p>
                                    </div>
                                )}
                            </div>

                            {/* Note Input */}
                            <div className="p-4 bg-card border-t border-main">
                                <form onSubmit={handleAddNote} className="relative">
                                    <input
                                        type="text"
                                        placeholder="Add an update about this customer..."
                                        className="w-full bg-input border border-main rounded-xl pr-12 pl-4 py-3 text-xs outline-none focus:border-primary text-main transition-all"
                                        value={newNote}
                                        onChange={e => setNewNote(e.target.value)}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newNote.trim()}
                                        className="absolute right-2 top-2 p-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-30"
                                    >
                                        <Send size={14} />
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                , document.body)}
        </div>
    );
};

export default EmployeeDashboard;
