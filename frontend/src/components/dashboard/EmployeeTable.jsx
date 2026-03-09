import React, { useState, useEffect } from 'react';
import { Search, Users, Eye, Pencil, Trash2, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

const EmployeeTable = ({ employees, onSearch, onView, onEdit, onDelete, search }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Reset to page 1 when search term or data length changes
    useEffect(() => {
        setCurrentPage(1);
    }, [search, employees.length]);

    // Calculate pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentEmployees = employees.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(employees.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    return (
        <div className="bg-card rounded-lg shadow-sm border border-main overflow-hidden">
            <div className="px-5 py-4 border-b border-main flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                    <h3 className="font-semibold text-main text-sm flex items-center gap-2"><Users size={15} className="text-primary" /> Employee Directory</h3>
                    <p className="text-xs text-muted mt-0.5">View and manage your team members</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted" />
                    <input
                        type="text"
                        placeholder="Search employees..."
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
                            <th className="hidden lg:table-cell px-5 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider border-none">Username</th>
                            <th className="hidden md:table-cell px-5 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider border-none">Email</th>
                            <th className="hidden sm:table-cell px-5 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider border-none">Type</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider border-none">Exp.</th>
                            <th className="px-5 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider rounded-r-lg border-none">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {currentEmployees.map(emp => (
                            <tr key={emp._id} className="bg-card hover:bg-primary-50 dark:hover:bg-slate-800 transition-colors group">
                                <td className="px-5 py-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-md bg-primary-50 dark:bg-primary-900/20 text-primary flex items-center justify-center font-bold text-xs">{emp.name.substring(0, 2).toUpperCase()}</div>
                                        <div>
                                            <p className="font-medium text-main text-sm">{emp.name}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="hidden lg:table-cell px-5 py-3 text-muted text-xs">@{emp.username}</td>
                                <td className="hidden md:table-cell px-5 py-3 text-muted text-xs">{emp.email}</td>
                                <td className="hidden sm:table-cell px-5 py-3">
                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${emp.serviceType === 'Full-time' ? 'bg-green-50 text-green-600 border border-green-100 dark:bg-green-900/20 dark:border-green-800' : 'bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800'}`}>
                                        {emp.serviceType || 'Full-time'}
                                    </span>
                                </td>
                                <td className="px-5 py-3">
                                    <div className="flex items-center gap-1 text-xs text-muted">
                                        <Clock size={12} className="text-muted opacity-50" />
                                        {emp.experience || 0}yr
                                    </div>
                                </td>
                                <td className="px-5 py-3 text-right">
                                    <div className="flex items-center justify-end gap-0.5">
                                        <button onClick={() => onView(emp)} className="p-1.5 rounded-md hover:bg-primary-50 text-muted hover:text-primary transition-colors" title="View"><Eye size={14} /></button>
                                        <button onClick={() => onEdit({ ...emp })} className="p-1.5 rounded-md hover:bg-primary-50 text-muted hover:text-primary transition-colors" title="Edit"><Pencil size={14} /></button>
                                        <button onClick={() => onDelete(emp._id)} className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-muted hover:text-red-500 transition-colors" title="Delete"><Trash2 size={14} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {employees.length === 0 && (
                            <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400 text-xs">No employees found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-main bg-card">
                    <span className="text-[11px] text-muted order-2 sm:order-1">
                        Showing <span className="font-bold text-main">{indexOfFirstItem + 1}</span> to <span className="font-bold text-main">{Math.min(indexOfLastItem, employees.length)}</span> of <span className="font-bold text-main">{employees.length}</span> employees
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

export default EmployeeTable;
