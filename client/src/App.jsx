import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// ── Public Pages (lazy loaded for code splitting) ──────────────
const Landing = lazy(() => import('./pages/Landing'));
const TutorialAdmission = lazy(() => import('./pages/TutorialAdmission'));
const ClassSelection = lazy(() => import('./pages/ClassSelection'));
const AdmissionForm = lazy(() => import('./pages/AdmissionForm'));
const SuccessPage = lazy(() => import('./pages/SuccessPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

// ── Admin Pages (lazy loaded — not bundled with public pages) ──
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminAppointments = lazy(() => import('./pages/admin/AdminAppointments'));
const AdminFreeSessions = lazy(() => import('./pages/admin/AdminFreeSessions'));
const AdminStudents = lazy(() => import('./pages/admin/AdminStudents'));
const StudentProfile = lazy(() => import('./pages/admin/StudentProfile'));
const AdminAdmissions = lazy(() => import('./pages/admin/AdminAdmissions'));
const AdmissionProfile = lazy(() => import('./pages/admin/AdmissionProfile'));
const AdminFees = lazy(() => import('./pages/admin/AdminFees'));

// ── Loading spinner shown while lazy chunks load ───────────────
function PageLoader() {
  return (
    <div className="page-loading">
      <div className="spinner spinner-lg" />
      <p>Loading...</p>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isLoggedIn, loading } = useAuth();
  if (loading) return <PageLoader />;
  return isLoggedIn ? children : <Navigate to="/admin/login" replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: { fontFamily: 'Inter, sans-serif', fontSize: '14px', maxWidth: '380px' },
          }}
        />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/admission" element={<TutorialAdmission />} />
            <Route path="/admission-form" element={<TutorialAdmission />} />
            <Route path="/select-class" element={<ClassSelection />} />
            <Route path="/apply/:classId" element={<AdmissionForm />} />
            <Route path="/success" element={<SuccessPage />} />

            {/* Admin */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/appointments" element={<ProtectedRoute><AdminAppointments /></ProtectedRoute>} />
            <Route path="/admin/free-sessions" element={<ProtectedRoute><AdminFreeSessions /></ProtectedRoute>} />
            <Route path="/admin/admissions" element={<ProtectedRoute><AdminAdmissions /></ProtectedRoute>} />
            <Route path="/admin/admissions/:id" element={<ProtectedRoute><AdmissionProfile /></ProtectedRoute>} />
            <Route path="/admin/students" element={<ProtectedRoute><AdminStudents /></ProtectedRoute>} />
            <Route path="/admin/students/:id" element={<ProtectedRoute><StudentProfile /></ProtectedRoute>} />
            <Route path="/admin/fees" element={<ProtectedRoute><AdminFees /></ProtectedRoute>} />

            {/* 404 — proper page instead of silent redirect */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
