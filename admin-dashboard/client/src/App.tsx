import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

// Route-level code splitting
const Login = lazy(() => import('@/pages/Login'));
const Signup = lazy(() => import('@/pages/Signup'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Contacts = lazy(() => import('@/pages/Contacts'));
const ContactDetail = lazy(() => import('@/pages/ContactDetail'));

export function Loading() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: 'var(--bg-base)', color: 'var(--text-primary)',
    }}>
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'var(--gradient)',
          boxShadow: '0 0 20px var(--border-glow)',
          marginBottom: 24,
        }}
      />
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{
          fontFamily: 'Poppins, sans-serif',
          fontSize: 16,
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          background: 'var(--gradient)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Loading...
      </motion.p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
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
