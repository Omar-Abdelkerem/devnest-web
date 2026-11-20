import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import { useTheme } from './hooks/useTheme'
import { AuthProvider, useAuth } from './context/AuthContext'

import ErrorBoundary from './components/ErrorBoundary'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollProgress from './components/ScrollProgress'

// Code-split every route page so the initial bundle stays tiny and fast
const HomePage = lazy(() => import('./pages/HomePage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const PublicProfilePage = lazy(() => import('./pages/PublicProfilePage'))
const SignInPage = lazy(() => import('./pages/SignInPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const ProjectDetailsPage = lazy(() => import('./pages/ProjectDetailsPage'))
const EditProjectPage = lazy(() => import('./pages/EditProjectPage'))
const NewProjectPage = lazy(() => import('./pages/NewProjectPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const ExplorePage = lazy(() => import('./pages/ExplorePage'))
const StarredProjectsPage = lazy(() => import('./pages/StarredProjectsPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))
const TermsPage = lazy(() => import('./pages/TermsPage'))
const ApiDocsPage = lazy(() => import('./pages/ApiDocsPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

function PageFallback() {
  return (
    <div className="flex-1 flex items-center justify-center py-24 bg-white dark:bg-[#161616]">
      <div className="flex items-center gap-3 text-sm font-mono text-gray-500 dark:text-gray-400">
        <span className="w-2.5 h-2.5 rounded-full bg-accent animate-ping" />
        Loading...
      </div>
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { user, isAuthLoading } = useAuth()
  if (isAuthLoading) return <PageFallback />
  if (!user) return <Navigate to="/login" replace />
  return children
}

function GuestOnlyRoute({ children }) {
  const { user, isAuthLoading } = useAuth()
  if (!isAuthLoading && user) {
    return <Navigate to={`/${user.username}`} replace />
  }
  return children
}

function SmartProfileRoute() {
  const { username } = useParams()
  const { user } = useAuth()

  if (user && user.username === username) {
    return <ProfilePage />
  }
  return <PublicProfilePage />
}

function AppRoutes({ theme, toggleTheme }) {
  const { user } = useAuth()

  return (
    <div className="font-sans antialiased min-h-screen w-full overflow-x-hidden flex flex-col bg-white dark:bg-[#161616]">
      <ScrollProgress />
      <Navbar theme={theme} onToggle={toggleTheme} />

      <main className="flex-1 flex flex-col w-full">
        <Suspense fallback={<PageFallback />}>
          <Routes>
            {/* Public pages render immediately without waiting for auth round-trip */}
            <Route path="/" element={user ? <Navigate to={`/${user.username}`} replace /> : <HomePage />} />
            <Route path="/welcome" element={<HomePage />} />
            <Route path="/login" element={<GuestOnlyRoute><SignInPage /></GuestOnlyRoute>} />
            <Route path="/register" element={<GuestOnlyRoute><RegisterPage /></GuestOnlyRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Navigate to={`/${user?.username || ''}`} replace /></ProtectedRoute>} />

            <Route path="/about" element={<AboutPage />} />
            <Route path="/api-docs" element={<ApiDocsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/explore" element={<ExplorePage />} />

            {/* Authenticated-only routes */}
            <Route path="/starred" element={<ProtectedRoute><StarredProjectsPage /></ProtectedRoute>} />
            <Route path="/projects/new" element={<ProtectedRoute><NewProjectPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/project/:projectId/edit" element={<ProtectedRoute><EditProjectPage /></ProtectedRoute>} />

            {/* Public project & profile views */}
            <Route path="/project/:projectId" element={<ProjectDetailsPage />} />
            <Route path="/:username" element={<SmartProfileRoute />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  const { theme, toggleTheme } = useTheme()
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes theme={theme} toggleTheme={toggleTheme} />
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  )
}
