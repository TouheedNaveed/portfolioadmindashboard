import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
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

export default function App() {
  return (
    <BrowserRouter>
      {/* Top-level global loader that mounts exactly once on app load */}
      <LoadingScreen forceMinimumDuration={true} />

      <Suspense fallback={<LoadingScreen forceMinimumDuration={false} />}>
        <AnimatePresence mode="wait">
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
                <Route path="/dashboard/settings" element={
                  <div style={{ color: 'var(--text-muted)', padding: 40, textAlign: 'center' }}>
                    <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 32, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Settings</h2>
                    <p>Coming soon</p>
                  </div>
                } />
              </Route>
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </BrowserRouter>
  );
}
