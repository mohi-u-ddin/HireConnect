import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

import { LandingPage } from './pages/public/LandingPage';
import { JobsPage } from './pages/public/JobsPage';
import { JobDetailsPage } from './pages/public/JobDetailsPage';
import { CompaniesPage } from './pages/public/CompaniesPage';
import { CompanyDetailsPage } from './pages/public/CompanyDetailsPage';
import { AboutPage } from './pages/public/AboutPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { UnauthorizedPage } from './pages/auth/UnauthorizedPage';

import { SeekerDashboardPage } from './pages/seeker/SeekerDashboardPage';
import { SavedJobsPage } from './pages/seeker/SavedJobsPage';
import { ApplicationsPage } from './pages/seeker/ApplicationsPage';
import { SeekerProfilePage } from './pages/seeker/SeekerProfilePage';

import { EmployerDashboardPage } from './pages/employer/EmployerDashboardPage';
import { EmployerJobsPage } from './pages/employer/EmployerJobsPage';
import { CreateJobPage } from './pages/employer/CreateJobPage';
import { EditJobPage } from './pages/employer/EditJobPage';
import { EmployerApplicationsPage } from './pages/employer/EmployerApplicationsPage';
import { CompanyProfilePage } from './pages/employer/CompanyProfilePage';

import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminCompaniesPage } from './pages/admin/AdminCompaniesPage';
import { AdminJobsPage } from './pages/admin/AdminJobsPage';
import { AdminApplicationsPage } from './pages/admin/AdminApplicationsPage';

import { SettingsPage } from './pages/shared/SettingsPage';
import { NotFoundPage } from './pages/shared/NotFoundPage';

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/jobs/:id" element={<JobDetailsPage />} />
              <Route path="/companies" element={<CompaniesPage />} />
              <Route path="/companies/:id" element={<CompanyDetailsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />

              {/* Job Seeker routes */}
              <Route
                path="/seeker/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['JOB_SEEKER']}>
                    <SeekerDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/seeker/saved-jobs"
                element={
                  <ProtectedRoute allowedRoles={['JOB_SEEKER']}>
                    <SavedJobsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/seeker/applications"
                element={
                  <ProtectedRoute allowedRoles={['JOB_SEEKER']}>
                    <ApplicationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/seeker/profile"
                element={
                  <ProtectedRoute allowedRoles={['JOB_SEEKER']}>
                    <SeekerProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/seeker/settings"
                element={
                  <ProtectedRoute allowedRoles={['JOB_SEEKER']}>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />

              {/* Employer routes */}
              <Route
                path="/employer/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['EMPLOYER']}>
                    <EmployerDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employer/jobs"
                element={
                  <ProtectedRoute allowedRoles={['EMPLOYER']}>
                    <EmployerJobsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employer/jobs/create"
                element={
                  <ProtectedRoute allowedRoles={['EMPLOYER']}>
                    <CreateJobPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employer/jobs/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={['EMPLOYER']}>
                    <EditJobPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employer/applications"
                element={
                  <ProtectedRoute allowedRoles={['EMPLOYER']}>
                    <EmployerApplicationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employer/company"
                element={
                  <ProtectedRoute allowedRoles={['EMPLOYER']}>
                    <CompanyProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employer/settings"
                element={
                  <ProtectedRoute allowedRoles={['EMPLOYER']}>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminUsersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/companies"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminCompaniesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/jobs"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminJobsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/applications"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminApplicationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
