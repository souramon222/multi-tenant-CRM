import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const EditEmployeeModal = ({ employee, isOpen, onClose, onUpdate, setEmployee, inputClass }) => {
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

    if (!isOpen || !employee) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate(e);
    };

    return createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-card rounded-xl shadow-xl w-full max-w-md animate-scale-in border border-main overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="bg-primary p-5 flex justify-between items-center text-white relative">
                    <div>
                        <h3 className="font-bold">Edit Employee</h3>
                        <p className="text-[10px] text-white/70 uppercase tracking-widest mt-0.5 font-medium">Update team member profile</p>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10" aria-label="Close modal"><X size={18} /></button>
                </div>
                <div className="p-6">
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Full Name</label>
                            <input type="text" required className={inputClass} value={employee.name} onChange={e => setEmployee({ ...employee, name: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Email Address</label>
                            <input type="email" required className={inputClass} value={employee.email} onChange={e => setEmployee({ ...employee, email: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Service Type</label>
                                <select className={inputClass} value={employee.serviceType || 'Full-time'} onChange={e => setEmployee({ ...employee, serviceType: e.target.value })}>
                                    <option value="Full-time">Full-time</option>
                                    <option value="Part-time">Part-time</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Experience (yrs)</label>
                                <input type="number" min="0" className={inputClass} value={employee.experience || 0} onChange={e => setEmployee({ ...employee, experience: e.target.value })} />
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-main mt-6">
                            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-input text-muted text-sm font-semibold rounded-lg hover:bg-primary-50 transition-colors border border-main order-2 sm:order-1">Cancel</button>
                            <button type="submit" className="flex-1 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark shadow-sm transition-all order-1 sm:order-2">Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default EditEmployeeModal;
