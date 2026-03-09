import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, UserCheck } from 'lucide-react';

const AssignEmployeeModal = ({ isOpen, onClose, customer, employees, onAssign }) => {
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [loading, setLoading] = useState(false);

    // Prevent body scroll and handle Escape key
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };

        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = originalStyle;
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen || !customer) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedEmployeeId) return;

        setLoading(true);
        const success = await onAssign(customer._id, selectedEmployeeId);
        setLoading(false);

        if (success) {
            setSelectedEmployeeId('');
            onClose();
        }
    };

    const inputClass = "w-full text-sm border border-main rounded-md p-2.5 bg-input placeholder-gray-400 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all";

    return createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-card w-full max-w-md rounded-xl shadow-xl border border-main overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
                <div className="bg-primary p-5 flex justify-between items-center text-white relative">
                    <h3 className="font-bold flex items-center gap-2">
                        <UserCheck size={18} className="text-white/90" />
                        Assign Employee
                    </h3>
                    <button onClick={onClose} className="text-white/70 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10" aria-label="Close modal">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="p-3 bg-primary-50 dark:bg-primary-900/10 rounded-lg border border-primary/10">
                        <p className="text-xs text-muted mb-1 font-medium uppercase tracking-wider">Customer</p>
                        <p className="text-sm font-bold text-main">{customer.name}</p>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Select Employee</label>
                        <select
                            className={inputClass}
                            value={selectedEmployeeId}
                            onChange={(e) => setSelectedEmployeeId(e.target.value)}
                            required
                        >
                            <option value="">— Select an employee —</option>
                            {employees.map(emp => (
                                <option key={emp._id} value={emp._id}>{emp.name} ({emp.serviceType})</option>
                            ))}
                        </select>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row gap-2 border-t border-main mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 bg-input text-muted font-semibold text-sm rounded-lg hover:bg-primary-50 transition-colors border border-main order-2 sm:order-1"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!selectedEmployeeId || loading}
                            className="flex-1 px-4 py-2.5 bg-primary text-white font-semibold text-sm rounded-lg hover:bg-primary-dark shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 order-1 sm:order-2"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : null}
                            Confirm Assignment
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default AssignEmployeeModal;
