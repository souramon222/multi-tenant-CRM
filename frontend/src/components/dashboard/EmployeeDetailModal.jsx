import React, { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, User, Mail, Briefcase, Clock, Calendar } from 'lucide-react';

const EmployeeDetailModal = ({ employee, isOpen, onClose, assignments = [] }) => {
    // Prevent body scroll and handle Escape key
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };

        // Save original overflow to restore later
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = originalStyle;
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    // Calculate assigned count efficiently using useMemo
    const assignedCount = useMemo(() => {
        if (!employee) return 0;
        return assignments.filter(a => a.employee?._id === employee._id).length;
    }, [assignments, employee]);

    if (!isOpen || !employee) return null;

    // Get initials (e.g., "John Doe" -> "JD", "Admin" -> "AD")
    const getInitials = (name) => {
        if (!name) return '??';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    return createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose} aria-hidden={!isOpen}>
            <div
                className="bg-card rounded-lg shadow-xl p-0 w-full max-w-sm overflow-hidden animate-scale-in border border-main"
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="employee-modal-title"
            >
                <div className="bg-primary p-6 flex flex-col items-center text-white relative">
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                        aria-label="Close modal"
                    >
                        <X size={18} />
                    </button>
                    <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-bold border border-white/30 mb-3 shadow-lg">
                        {getInitials(employee.name)}
                    </div>
                    <h3 id="employee-modal-title" className="text-lg font-bold">{employee.name}</h3>
                    <p className="text-white/80 text-xs font-medium uppercase tracking-widest mt-1">{employee.role}</p>
                </div>
                <div className="p-6 space-y-5">
                    <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary"><User size={16} /></div>
                        <div>
                            <p className="text-[10px] text-muted font-bold uppercase tracking-wider">Username</p>
                            <p className="text-sm font-medium text-main">@{employee.username}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary"><Mail size={16} /></div>
                        <div className="overflow-hidden">
                            <p className="text-[10px] text-muted font-bold uppercase tracking-wider">Email Address</p>
                            <p className="text-sm font-medium text-main truncate">{employee.email}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-start gap-4">
                            <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary"><Briefcase size={16} /></div>
                            <div>
                                <p className="text-[10px] text-muted font-bold uppercase tracking-wider">Experience</p>
                                <p className="text-sm font-medium text-main">{employee.experience || 0} Years</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary"><Clock size={16} /></div>
                            <div>
                                <p className="text-[10px] text-muted font-bold uppercase tracking-wider">Assigned</p>
                                <p className="text-sm font-medium text-main">{assignedCount} Customers</p>
                            </div>
                        </div>
                    </div>
                    <div className="pt-4 border-t border-main">
                        <div className="flex items-center justify-between text-[11px] text-muted">
                            <div className="flex items-center gap-1.5"><Calendar size={12} /> Joined LeadOrbit</div>
                            <span>{employee.createdAt ? new Date(employee.createdAt).toLocaleDateString() : 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default EmployeeDetailModal;
