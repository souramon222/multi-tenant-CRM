import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const EditCustomerModal = ({ customer, isOpen, onClose, onUpdate, setCustomer, inputClass }) => {
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

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate(e);
    };

    return createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-card rounded-xl shadow-xl w-full max-w-md animate-scale-in border border-main overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="bg-primary p-5 flex justify-between items-center text-white relative">
                    <div>
                        <h3 className="font-bold">Edit Customer</h3>
                        <p className="text-[10px] text-white/70 uppercase tracking-widest mt-0.5 font-medium">Update customer information</p>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10" aria-label="Close modal"><X size={18} /></button>
                </div>
                <div className="p-6">
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Customer Name</label>
                            <input type="text" required className={inputClass} value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Status</label>
                                <select className={inputClass} value={customer.status || 'New'} onChange={e => setCustomer({ ...customer, status: e.target.value })}>
                                    <option value="New">New</option>
                                    <option value="Contacted">Contacted</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="On Hold">On Hold</option>
                                    <option value="Resolved">Resolved</option>
                                    <option value="Closed">Closed</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Priority</label>
                                <select className={inputClass} value={customer.priority || 'Medium'} onChange={e => setCustomer({ ...customer, priority: e.target.value })}>
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                    <option value="Urgent">Urgent</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Complaint Details</label>
                            <textarea rows={3} className={inputClass + " resize-none"} value={customer.complaint || ''} onChange={e => setCustomer({ ...customer, complaint: e.target.value })} />
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

export default EditCustomerModal;
