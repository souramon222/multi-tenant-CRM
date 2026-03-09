import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const RoleRoute = ({ roles }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!roles.includes(user.role)) {
        // Redirect to their appropriate dashboard based on role
        switch (user.role) {
            case 'superadmin': return <Navigate to="/superadmin" replace />;
            case 'admin': return <Navigate to="/admin" replace />;
            case 'employee': return <Navigate to="/employee" replace />;
            default: return <Navigate to="/login" replace />;
        }
    }

    return <Outlet />;
};

export default RoleRoute;
