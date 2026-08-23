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
import NotFoundPage from './pages/NotFoundPage'
import NewProjectPage from './pages/NewProjectPage'
import SettingsPage from './pages/SettingsPage' // <-- NEW IMPORT

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

          <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" replace />} />
          <Route path="/projects/new" element={user ? <NewProjectPage /> : <Navigate to="/login" replace />} />

          {/* NEW ROUTE: Settings / Edit Profile */}
          <Route path="/settings" element={user ? <SettingsPage /> : <Navigate to="/login" replace />} />

          <Route path="/profile-demo" element={<ProfilePage />} />
          <Route path="/profile-empty-demo" element={<ProfileEmptyPage />} />

          <Route path="/project/:projectId" element={<ProjectDetailsPage />} />
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