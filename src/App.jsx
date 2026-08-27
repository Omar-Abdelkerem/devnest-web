import { useTheme } from './hooks/useTheme'
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import ProfilePage from './pages/ProfilePage'
import ProfileEmptyPage from './pages/ProfileEmptyPage'
import SignInPage from './pages/SignInPage'
import RegisterPage from './pages/RegisterPage'
import ProjectDetailsPage from './pages/ProjectDetailsPage'
import EditProjectPage from './pages/EditProjectPage'
import NotFoundPage from './pages/NotFoundPage'
import NewProjectPage from './pages/NewProjectPage'
import SettingsPage from './pages/SettingsPage'
import ExplorePage from './pages/ExplorePage'
import PublicProfilePage from './pages/PublicProfilePage'
import StarredProjectsPage from './pages/StarredProjectsPage'
import AboutPage from './pages/AboutPage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import ApiDocsPage from './pages/ApiDocsPage'
// This component decides which profile view to render
function SmartProfileRoute() {
  const { username } = useParams();
  const { user } = useAuth();

  // If you are logged in AND viewing your own URL, show the dashboard with edit buttons
  if (user && user.username === username) {
    return <ProfilePage />;
  }

  // Otherwise, you are a guest looking at someone else (or logged out), show the public view
  return <PublicProfilePage />;
}


function AppRoutes({ theme, toggleTheme }) {
  const { user, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#161616] flex items-center justify-center">
        <span className="text-gray-500 font-mono text-sm tracking-widest uppercase">Verifying session...</span>
      </div>
    );
  }

  return (
    <div className="font-sans antialiased min-h-screen w-full overflow-x-hidden flex flex-col bg-white dark:bg-[#161616]">
      <Navbar theme={theme} onToggle={toggleTheme} />

      <main className="flex-1 flex flex-col w-full">
        <Routes>
          {/* FIX: Redirect to direct username URL (No /profile/ or /u/ prefix) */}
          <Route path="/" element={user ? <Navigate to={`/${user.username}`} replace /> : <HomePage />} />
          <Route path="/welcome" element={<HomePage />} />
          <Route path="/login" element={user ? <Navigate to={`/${user.username}`} replace /> : <SignInPage />} />
          <Route path="/register" element={user ? <Navigate to={`/${user.username}`} replace /> : <RegisterPage />} />

          {/* Legacy route fallback */}
          <Route path="/profile" element={user ? <Navigate to={`/${user.username}`} replace /> : <Navigate to="/login" replace />} />

          {/* Static / Legal / Doc Pages */}
          <Route path="/about"    element={<AboutPage />} />
          <Route path="/api-docs" element={<ApiDocsPage />} />
          <Route path="/privacy"  element={<PrivacyPage />} />
          <Route path="/terms"    element={<TermsPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/starred" element={<StarredProjectsPage />} />
          <Route path="/projects/new" element={user ? <NewProjectPage /> : <Navigate to="/login" replace />} />
          <Route path="/settings" element={user ? <SettingsPage /> : <Navigate to="/login" replace />} />
          <Route path="/project/:projectId/edit" element={user ? <EditProjectPage /> : <Navigate to="/login" replace />} />
          <Route path="/project/:projectId" element={<ProjectDetailsPage />} />
          <Route path="/profile-demo" element={<ProfilePage />} />
          <Route path="/profile-empty-demo" element={<ProfileEmptyPage />} />
          <Route path="/:username" element={<SmartProfileRoute />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  const { theme, toggleTheme } = useTheme()
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes theme={theme} toggleTheme={toggleTheme} />
      </BrowserRouter>
    </AuthProvider>
  )
}