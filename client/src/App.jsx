import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Public Pages
import Landing from './pages/Landing';
import ClassSelection from './pages/ClassSelection';
import AdmissionForm from './pages/AdmissionForm';
import TutorialAdmission from './pages/TutorialAdmission';
import SuccessPage from './pages/SuccessPage';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminFreeSessions from './pages/admin/AdminFreeSessions';
import AdminStudents from './pages/admin/AdminStudents';
import StudentProfile from './pages/admin/StudentProfile';
import AdminAdmissions from './pages/admin/AdminAdmissions';
import AdmissionProfile from './pages/admin/AdmissionProfile';
import AdminFees from './pages/admin/AdminFees';

function ProtectedRoute({ children }) {
  const { isLoggedIn, loading } = useAuth();
  if (loading) return (
    <div className="page-loading">
      <div className="spinner spinner-lg" />
      <p>Loading...</p>
    </div>
  );
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

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
