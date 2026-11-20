import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { useTheme } from './hooks/useTheme'
import { AuthProvider, useAuth } from './context/AuthContext'

import ErrorBoundary from './components/ErrorBoundary'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import SmoothScroll from './components/SmoothScroll'

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
    <div className="flex-1 flex items-center justify-center py-24 bg-[#f8fafc] dark:bg-[#07070b]">
      <div className="flex items-center gap-3 px-4 py-2 rounded-full glass-panel text-xs font-mono text-slate-600 dark:text-slate-300">
        <span className="w-2 h-2 rounded-full bg-accent-light animate-ping" />
        Loading workspace...
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
  const location = useLocation()

  return (
    <div className="font-sans antialiased min-h-screen w-full overflow-x-hidden flex flex-col bg-[#f8fafc] dark:bg-[#07070b] text-slate-900 dark:text-slate-100 selection:bg-accent/30 selection:text-white">
      <SmoothScroll />
      <Navbar theme={theme} onToggle={toggleTheme} />

      <main className="flex-1 flex flex-col w-full relative">
        <Suspense fallback={<PageFallback />}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1 flex flex-col w-full"
            >
              <Routes location={location}>
                {/* Public pages render immediately without waiting for auth round-trip */}
                <Route path="/" element={<HomePage />} />
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
            </motion.div>
          </AnimatePresence>
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
      <MotionConfig reducedMotion="user">
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes theme={theme} toggleTheme={toggleTheme} />
          </BrowserRouter>
        </AuthProvider>
      </MotionConfig>
    </ErrorBoundary>
  )
}
