import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

// Route-level code splitting
const Login = lazy(() => import('@/pages/Login'));
const Signup = lazy(() => import('@/pages/Signup'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Contacts = lazy(() => import('@/pages/Contacts'));
const ContactDetail = lazy(() => import('@/pages/ContactDetail'));
const Settings = lazy(() => import('@/pages/Settings'));

export default function App() {
  return (
    <BrowserRouter>
      {/* Top-level global loader that mounts exactly once on app load */}
      <LoadingScreen forceMinimumDuration={true} />

      {/* NOTE: AnimatePresence mode="wait" removed — it blocked Outlet content
          from rendering (stayed at opacity:0) when navigating between tabs.
          Page content animations are handled at the component level instead. */}
      <Suspense fallback={<LoadingScreen forceMinimumDuration={false} />}>
        <Routes>
          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Protected dashboard routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/contacts" element={<Contacts />} />
              <Route path="/dashboard/contacts/:id" element={<ContactDetail />} />
              <Route path="/dashboard/settings" element={<Settings />} />
            </Route>
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
