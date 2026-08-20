import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import ManagerDashboard from './pages/dashboard/ManagerDashboard';
import TechDashboard from './pages/dashboard/TechDashboard';
import TicketList from './pages/tickets/TicketList';
import TicketCreate from './pages/tickets/TicketCreate';
import TicketDetail from './pages/tickets/TicketDetail';
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

function PrivateRoute({ children, role, allowedRoles }) {
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/login" replace />;
  }
  return <AppShell currentRole={role}>{children}</AppShell>;
}

export default function App() {
  const [role, setRole] = React.useState('admin'); // For demo purposes

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Routes>
          <Route path="/login" element={<Login setRole={setRole} />} />
          
          {/* Admin Routes */}
          <Route path="/dashboard/admin" element={<PrivateRoute role={role} allowedRoles={['admin']}><AdminDashboard /></PrivateRoute>} />
          <Route path="/assignments" element={<PrivateRoute role={role} allowedRoles={['admin']}><AssignmentList /></PrivateRoute>} />
          <Route path="/teams" element={<PrivateRoute role={role} allowedRoles={['admin']}><TeamManagement /></PrivateRoute>} />
          <Route path="/branches" element={<PrivateRoute role={role} allowedRoles={['admin']}><BranchManagement /></PrivateRoute>} />
          <Route path="/fuel/rates" element={<PrivateRoute role={role} allowedRoles={['admin']}><FuelRates /></PrivateRoute>} />
          <Route path="/fuel/review" element={<PrivateRoute role={role} allowedRoles={['admin']}><FuelReview /></PrivateRoute>} />
          <Route path="/reports" element={<PrivateRoute role={role} allowedRoles={['admin']}><Reports /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute role={role} allowedRoles={['admin']}><Settings /></PrivateRoute>} />

          {/* Manager Routes */}
          <Route path="/dashboard/manager" element={<PrivateRoute role={role} allowedRoles={['manager']}><ManagerDashboard /></PrivateRoute>} />
          <Route path="/tickets/new" element={<PrivateRoute role={role} allowedRoles={['manager']}><TicketCreate /></PrivateRoute>} />

          {/* Tech Routes */}
          <Route path="/dashboard/tech" element={<PrivateRoute role={role} allowedRoles={['tech']}><TechDashboard /></PrivateRoute>} />

          {/* Shared Routes */}
          <Route path="/tickets" element={<PrivateRoute role={role} allowedRoles={['admin', 'manager']}><TicketList role={role} /></PrivateRoute>} />
          <Route path="/tickets/:id" element={<PrivateRoute role={role} allowedRoles={['admin', 'manager', 'tech']}><TicketDetail role={role} /></PrivateRoute>} />
          <Route path="/archive" element={<PrivateRoute role={role} allowedRoles={['admin', 'manager']}><ArchiveList role={role} /></PrivateRoute>} />
          <Route path="/notifications" element={<PrivateRoute role={role} allowedRoles={['admin', 'manager', 'tech']}><Notifications /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute role={role} allowedRoles={['admin', 'manager', 'tech']}><UserProfile /></PrivateRoute>} />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
