import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SubmissionWorkspace from './pages/SubmissionWorkspace';
import AnalysisResultsPage from './pages/AnalysisResultsPage';
import ReviewQueuePage from './pages/ReviewQueuePage';
import ApprovalPage from './pages/ApprovalPage';
import GuidelinesPage from './pages/GuidelinesPage';
import AuditHistoryPage from './pages/AuditHistoryPage';

// Authenticated layout wrapper
const AppLayout = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Application Workspace */}
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="submit" element={<SubmissionWorkspace />} />
            <Route path="analysis/:id" element={<AnalysisResultsPage />} />
            <Route path="queue" element={<ReviewQueuePage />} />
            <Route path="approval/:id" element={<ApprovalPage />} />
            <Route path="guidelines" element={<GuidelinesPage />} />
            <Route path="audit" element={<AuditHistoryPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
