import { useTheme } from './hooks/useTheme'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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
import ExplorePage from './pages/ExplorePage'         // <-- NEW IMPORT
import PublicProfilePage from './pages/PublicProfilePage' // <-- NEW IMPORT
import StaticPage from './pages/StaticPage'
import StarredProjectsPage from './pages/StarredProjectsPage'

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
    <div className="font-sans antialiased min-h-screen flex flex-col bg-white dark:bg-[#161616]">
      <Navbar theme={theme} onToggle={toggleTheme} />

      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={user ? <Navigate to="/profile" replace /> : <HomePage />} />
          <Route path="/welcome" element={<HomePage />} />
          <Route path="/login" element={user ? <Navigate to="/profile" replace /> : <SignInPage />} />
          <Route path="/register" element={user ? <Navigate to="/profile" replace /> : <RegisterPage />} />

          {/* NEW ROUTES */}
          <Route path="/about" element={<StaticPage title="About DevNest" />} />
          <Route path="/api-docs" element={<StaticPage title="API Documentation (Swagger)" />} />
          <Route path="/privacy" element={<StaticPage title="Privacy Policy" />} />
          <Route path="/terms" element={<StaticPage title="Terms of Service" />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/u/:username" element={<PublicProfilePage />} />
          <Route path="/starred" element={<StarredProjectsPage />} />
          <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" replace />} />
          <Route path="/projects/new" element={user ? <NewProjectPage /> : <Navigate to="/login" replace />} />
          <Route path="/settings" element={user ? <SettingsPage /> : <Navigate to="/login" replace />} />

          <Route path="/project/:projectId/edit" element={user ? <EditProjectPage /> : <Navigate to="/login" replace />} />
          <Route path="/project/:projectId" element={<ProjectDetailsPage />} />

          <Route path="/profile-demo" element={<ProfilePage />} />
          <Route path="/profile-empty-demo" element={<ProfileEmptyPage />} />
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