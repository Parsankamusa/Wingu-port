import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardFooter from './components/layout/DashboardFooter';
import DashboardHeader from './components/layout/DashboardHeader';
import Footer from './components/layout/Footer';
import Header from './components/layout/Header';

// Import all page components
import AboutUsPage from './pages/public/AboutUsPage';
import ContactUsPage from './pages/public/ContactUsPage';
import EmailVerificationPage from './pages/public/EmailVerificationPage';
import ForgotPasswordPage from './pages/public/ForgotPasswordPage';
import HelpFAQPage from './pages/public/HelpFAQPage';
import HomePage from './pages/public/HomePage';
import PricingPage from './pages/public/PricingPage';
import PrivacyPolicyPage from './pages/public/PrivacyPolicyPage';
import ResetPasswordPage from './pages/public/ResetPasswordPage';
import SignInPage from './pages/public/SignInPage';
import SignUpPage from './pages/public/SignUpPage';
import TermsOfServicePage from './pages/public/TermsOfServicePage';
import UserDashboard from './pages/user/UserDashboard';
// import ProfileWizard from './pages/user/ProfileWizard';
import AdminDashboard from './pages/admin/AdminDashboard';
import JobApplicationForm from './pages/professional/JobApplicationForm';
import JobDetailsPage from './pages/professional/JobDetailsPage';
import JobSearchPage from './pages/professional/JobSearchPage';
import MyApplicationsPage from './pages/professional/MyApplicationsPage';
import SavedJobsPage from './pages/professional/SavedJobsPage';
import CandidateProfilePage from './pages/recruiter/CandidateProfilePage';
import CompanyProfilePage from './pages/recruiter/CompanyProfilePage';
import ManageJobListingsPage from './pages/recruiter/ManageJobListingsPage';
import PostJobWizard from './pages/recruiter/PostJobWizard';
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import ViewApplicationsPage from './pages/recruiter/ViewApplicationsPage';
import AccountSettingsPage from './pages/user/AccountSettingsPage';
import ManageProfilePage from './pages/user/ManageProfilePage';
import NotificationsCenterPage from './pages/user/NotificationsCenterPage';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

// This gatekeeper component is now robust against race conditions on refresh.
const DashboardGate = () => {
    const { user, isLoading } = useAuth();
    const navigate = useNavigate();

    // If authentication is still in progress, we show a loading spinner.
    // This prevents any rendering attempt before the user's role is known.
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-160px)]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    // Once loading is complete, we can safely check the user's role.
    if (user?.role === 'recruiter') {
        return <RecruiterDashboard onNavigate={navigate} />;
    }
    
    if (user?.role === 'professional') {
        return <UserDashboard />;
    }

    if (user?.role === 'admin') {
        return <Navigate to="/admin-dashboard" replace />;
    }
    
    // The ProtectedRoute wrapper will handle the final redirect to /signin if the user is null
    // after loading, so we don't need an explicit redirect here. This prevents the bug.
    return null;
};

function App() {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigate = (path) => navigate(path);
  
  const isDashboardPage = () => {
    const protectedPaths = [
        '/dashboard', '/profile-wizard', '/manage-profile', '/subscription-management',
        '/notifications', '/account-settings', '/job-search', '/job-details', '/job-application',
        '/my-applications', '/saved-jobs', '/post-job', '/manage-jobs', '/view-applications',
        '/candidate-profile', '/company-profile', '/admin-dashboard'
    ];
    return protectedPaths.some(path => location.pathname.startsWith(path));
  };

  // A top-level loading check for the very first load of the app.
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-secondary-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-secondary-50 font-sans">
      <ScrollToTop />
      {isDashboardPage() && user ? <DashboardHeader /> : <Header onNavigate={handleNavigate} />}
      <main className={`flex-grow ${isDashboardPage() && user ? 'pt-20' : 'pt-[88px]'}`}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage onNavigate={handleNavigate} />} />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/contact" element={<ContactUsPage />} />
          <Route path="/pricing" element={<PricingPage onNavigate={handleNavigate} />} />
          <Route path="/help" element={<HelpFAQPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          
          {/* Auth Routes */}
          <Route path="/signin" element={<SignInPage onNavigate={handleNavigate} />} />
          <Route path="/signup" element={<SignUpPage onNavigate={handleNavigate} />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage onNavigate={handleNavigate} />} />
          <Route path="/reset-password" element={<ResetPasswordPage onNavigate={handleNavigate} />} />
          <Route path="/email-verification" element={<EmailVerificationPage />} />

          {/* --- Protected Routes --- */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardGate /></ProtectedRoute>} />
          
          {/* <Route path="/profile-wizard" element={<ProtectedRoute><ProfileWizard /></ProtectedRoute>} /> */}
          <Route path="/notifications" element={<ProtectedRoute><NotificationsCenterPage /></ProtectedRoute>} />
          <Route path="/account-settings" element={<ProtectedRoute><AccountSettingsPage /></ProtectedRoute>} />

          <Route path="/manage-profile" element={<ProtectedRoute requiredUserType="professional"><ManageProfilePage /></ProtectedRoute>} />
          <Route path="/job-search" element={<ProtectedRoute requiredUserType="professional"><JobSearchPage onNavigate={handleNavigate} /></ProtectedRoute>} />
          <Route path="/job-details/:jobId" element={<ProtectedRoute requiredUserType="professional"><JobDetailsPage /></ProtectedRoute>} />
          <Route path="/job-application/:jobId" element={<ProtectedRoute requiredUserType="professional"><JobApplicationForm /></ProtectedRoute>} />
          <Route path="/my-applications" element={<ProtectedRoute requiredUserType="professional"><MyApplicationsPage /></ProtectedRoute>} />
          <Route path="/saved-jobs" element={<ProtectedRoute requiredUserType="professional"><SavedJobsPage /></ProtectedRoute>} />

          <Route path="/post-job" element={<ProtectedRoute requiredUserType="recruiter"><PostJobWizard /></ProtectedRoute>} />
          <Route path="/manage-jobs" element={<ProtectedRoute requiredUserType="recruiter"><ManageJobListingsPage onNavigate={handleNavigate} /></ProtectedRoute>} />
          <Route path="/view-applications/:jobId" element={<ProtectedRoute requiredUserType="recruiter"><ViewApplicationsPage /></ProtectedRoute>} />
          <Route path="/candidate-profile/:candidateId" element={<ProtectedRoute requiredUserType="recruiter"><CandidateProfilePage onNavigate={handleNavigate} /></ProtectedRoute>} />
          <Route path="/company-profile" element={<ProtectedRoute requiredUserType="recruiter"><CompanyProfilePage /></ProtectedRoute>} />

          <Route path="/admin-dashboard" element={<ProtectedRoute requiredUserType="admin"><AdminDashboard /></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {isDashboardPage() && user ? <DashboardFooter /> : <Footer />}
    </div>
  );
}

export default App;
