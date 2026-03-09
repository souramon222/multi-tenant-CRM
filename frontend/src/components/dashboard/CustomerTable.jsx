import React, { useState, useEffect } from 'react';
import { Building, Search, Pencil, Trash2, ChevronLeft, ChevronRight, UserCheck } from 'lucide-react';

const CustomerTable = ({ customers, onSearch, onEdit, onDelete, onEditAssignment, search }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Reset to page 1 when search term or data length changes
    useEffect(() => {
        setCurrentPage(1);
    }, [search, customers.length]);

    // Calculate pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCustomers = customers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(customers.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    return (
        <div className="bg-card rounded-lg shadow-sm border border-main overflow-hidden">
            <div className="px-5 py-4 border-b border-main flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                    <h3 className="font-semibold text-main text-sm flex items-center gap-2"><Building size={15} className="text-blue-500" /> Customer Directory</h3>
                    <p className="text-xs text-muted mt-0.5">Track complaints and employee assignments</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted" />
                    <input
                        type="text"
                        placeholder="Search customers..."
                        className="pl-8 py-1.5 text-xs border border-main rounded-md w-48 bg-input text-main focus:border-primary outline-none transition-colors"
                        value={search}
                        onChange={e => onSearch(e.target.value)}
                    />
                </div>
            </div>
            <div className="overflow-x-auto p-4">
                <table className="w-full text-sm border-separate" style={{ borderSpacing: '0' }}>
                    <thead>
                        <tr className="bg-primary">
                            <th className="px-5 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider rounded-l-lg border-none">Name</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider border-none">Status</th>
                            <th className="hidden sm:table-cell px-5 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider border-none">Priority</th>
                            <th className="hidden md:table-cell px-5 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider border-none">Assigned To</th>
                            <th className="px-5 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider rounded-r-lg border-none">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {currentCustomers.map(cust => {
                            return (
                                <tr key={cust._id} className="bg-card hover:bg-primary-50 dark:hover:bg-slate-800 transition-colors group">
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center font-bold text-xs">{cust.name.substring(0, 2).toUpperCase()}</div>
                                            <div>
                                                <p className="font-medium text-main text-sm">{cust.name}</p>
                                                <p className="text-[10px] text-muted">{cust.email || 'No email'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cust.status === 'Resolved' || cust.status === 'Closed' ? 'bg-green-50 text-green-600 border-green-100' :
                                            cust.status === 'In Progress' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                cust.status === 'On Hold' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                                    'bg-gray-50 text-gray-600 border-gray-100'
                                            }`}>
                                            {cust.status || 'New'}
                                        </span>
                                    </td>
                                    <td className="hidden sm:table-cell px-5 py-3">
                                        <div className="flex items-center gap-1.5">
                                            <div className={`w-1.5 h-1.5 rounded-full ${cust.priority === 'Urgent' ? 'bg-red-500 animate-pulse' :
                                                cust.priority === 'High' ? 'bg-orange-500' :
                                                    cust.priority === 'Medium' ? 'bg-yellow-500' : 'bg-gray-300'
                                                }`}></div>
                                            <span className="text-xs text-gray-600 font-medium">{cust.priority || 'Medium'}</span>
                                        </div>
                                    </td>
                                    <td className="hidden md:table-cell px-5 py-3">
                                        {cust.assignedEmployee ? (
                                            <span className="text-xs font-medium text-main bg-input px-2 py-0.5 rounded border border-main truncate block max-w-30" title={cust.assignedEmployee.name}>
                                                {cust.assignedEmployee.name}
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => onEditAssignment(cust)}
                                                className="text-[10px] font-bold text-primary hover:text-primary-dark flex items-center gap-1 transition-colors"
                                            >
                                                <UserCheck size={12} /> Assign Employee
                                            </button>
                                        )}
                                    </td>
                                    <td className="px-5 py-3 text-right">
                                        <div className="flex items-center justify-end gap-0.5">
                                            <button onClick={() => onEdit({ ...cust })} className="p-1.5 rounded-md hover:bg-primary-50 text-muted hover:text-primary transition-colors" title="Edit"><Pencil size={14} /></button>
                                            <button onClick={() => onDelete(cust._id)} className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-muted hover:text-red-500 transition-colors" title="Delete"><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {customers.length === 0 && (
                            <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400 text-xs">No customers yet.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-main bg-card">
                    <span className="text-[11px] text-muted order-2 sm:order-1">
                        Showing <span className="font-bold text-main">{indexOfFirstItem + 1}</span> to <span className="font-bold text-main">{Math.min(indexOfLastItem, customers.length)}</span> of <span className="font-bold text-main">{customers.length}</span> customers
                    </span>
                    <div className="flex items-center gap-1 order-1 sm:order-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-1.5 text-xs border border-main rounded-md text-muted hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={14} />
                        </button>

                        <div className="flex items-center gap-1">
                            {[...Array(totalPages)].map((_, idx) => (
                                <button
                                    key={idx + 1}
                                    onClick={() => handlePageChange(idx + 1)}
                                    className={`w-7 h-7 flex items-center justify-center text-xs font-medium rounded-md transition-colors ${currentPage === idx + 1
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'border border-main text-muted hover:bg-primary-50 hover:text-primary'
                                        }`}
                                >
                                    {idx + 1}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-1.5 text-xs border border-main rounded-md text-muted hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerTable;
