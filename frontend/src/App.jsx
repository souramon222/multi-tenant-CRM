import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AuthProvider from './context/AuthProvider';
import Login from './pages/Login';
import EmployeeLogin from './pages/EmployeeLogin';
import RegisterCompany from './pages/RegisterCompany';
import Landing from './pages/Landing';
import About from './pages/About';

import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';

// Placeholder imports for dashboards (we will create these next)
import SuperAdminDashboard from './pages/dashboard/SuperAdminDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import EmployeeDashboard from './pages/dashboard/EmployeeDashboard';
import Layout from './components/Layout';

import ThemeProvider from './context/ThemeProvider';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/employee-login" element={<EmployeeLogin />} />
            <Route path="/register" element={<RegisterCompany />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route element={<RoleRoute roles={['superadmin']} />}>
                  <Route path="/superadmin" element={<SuperAdminDashboard />} />
                </Route>
                <Route element={<RoleRoute roles={['admin']} />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                </Route>
                <Route element={<RoleRoute roles={['employee']} />}>
                  <Route path="/employee" element={<EmployeeDashboard />} />
                </Route>
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
