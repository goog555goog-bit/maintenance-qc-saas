import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, clearAuthSession, isTokenExpired } from './core/auth';
import Login from './pages/Login';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import ManagerDashboard from './pages/dashboard/ManagerDashboard';
import TechDashboard from './pages/dashboard/TechDashboard';
import TicketList from './pages/tickets/TicketList';
import TicketCreate from './pages/tickets/TicketCreate';
import TicketDetail from './pages/tickets/TicketDetail';
import ServiceReport from './pages/tickets/ServiceReport';
import AssignmentList from './pages/assignments/AssignmentList';
import TeamManagement from './pages/teams/TeamManagement';
import BranchManagement from './pages/branches/BranchManagement';
import FuelRates from './pages/fuel/FuelRates';
import FuelReview from './pages/fuel/FuelReview';
import Reports from './pages/reports/Reports';
import ArchiveList from './pages/archive/ArchiveList';
import Notifications from './pages/notifications/Notifications';
import Settings from './pages/settings/Settings';
import UserProfile from './pages/profile/UserProfile';

import AppShell from './components/layout/AppShell';

function getStoredRole() {
  try {
    const raw = localStorage.getItem('auth_user');
    if (!raw) return null;
    const u = JSON.parse(raw);
    const r = String(u.role || '').toUpperCase();
    if (r === 'CENTRAL_ADMIN' || r === 'ADMIN') return 'admin';
    if (r === 'BRANCH_MANAGER' || r === 'MANAGER') return 'manager';
    if (r === 'TECHNICIAN' || r === 'TECH') return 'tech';
    return 'tech';
  } catch {
    return null;
  }
}

function PrivateRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('auth_token');
  const storedUserRole = getStoredRole();
  const expired = isTokenExpired();

  if (!token || expired) {
    clearAuthSession();
    return <Navigate to="/login" replace />;
  }

  const currentRole = storedUserRole || 'tech';
  if (allowedRoles && !allowedRoles.includes(currentRole)) {
    return <Navigate to={`/dashboard/${currentRole}`} replace />;
  }

  return <AppShell currentRole={currentRole}>{children}</AppShell>;
}

export default function App() {
  const currentRole = getStoredRole() || 'admin';

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Admin Routes */}
          <Route path="/dashboard/admin" element={<PrivateRoute allowedRoles={['admin']}><AdminDashboard /></PrivateRoute>} />
          <Route path="/assignments" element={<PrivateRoute allowedRoles={['admin']}><AssignmentList /></PrivateRoute>} />
          <Route path="/teams" element={<PrivateRoute allowedRoles={['admin']}><TeamManagement /></PrivateRoute>} />
          <Route path="/branches" element={<PrivateRoute allowedRoles={['admin']}><BranchManagement /></PrivateRoute>} />
          <Route path="/fuel/rates" element={<PrivateRoute allowedRoles={['admin']}><FuelRates /></PrivateRoute>} />
          <Route path="/fuel/review" element={<PrivateRoute allowedRoles={['admin']}><FuelReview /></PrivateRoute>} />
          <Route path="/reports" element={<PrivateRoute allowedRoles={['admin']}><Reports /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute allowedRoles={['admin']}><Settings /></PrivateRoute>} />

          {/* Manager Routes */}
          <Route path="/dashboard/manager" element={<PrivateRoute allowedRoles={['manager']}><ManagerDashboard /></PrivateRoute>} />
          <Route path="/tickets/new" element={<PrivateRoute allowedRoles={['manager']}><TicketCreate /></PrivateRoute>} />

          {/* Tech Routes */}
          <Route path="/dashboard/tech" element={<PrivateRoute allowedRoles={['tech']}><TechDashboard /></PrivateRoute>} />

          {/* Shared Routes */}
          <Route path="/tickets" element={<PrivateRoute allowedRoles={['admin', 'manager', 'tech']}><TicketList role={currentRole} /></PrivateRoute>} />
          <Route path="/tickets/:id" element={<PrivateRoute allowedRoles={['admin', 'manager', 'tech']}><TicketDetail role={currentRole} /></PrivateRoute>} />
          <Route path="/tickets/:id/report" element={<PrivateRoute allowedRoles={['admin', 'manager', 'tech']}><ServiceReport /></PrivateRoute>} />
          <Route path="/archive" element={<PrivateRoute allowedRoles={['admin', 'manager', 'tech']}><ArchiveList role={currentRole} /></PrivateRoute>} />
          <Route path="/notifications" element={<PrivateRoute allowedRoles={['admin', 'manager', 'tech']}><Notifications /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute allowedRoles={['admin', 'manager', 'tech']}><UserProfile /></PrivateRoute>} />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
