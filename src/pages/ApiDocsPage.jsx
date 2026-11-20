import { useDocumentTitle } from '../hooks/useDocumentTitle'
import VolumetricBackground from '../components/VolumetricBackground'

function Badge({ children }) {
  return (
    <span className="inline-flex items-center text-xs font-mono px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.1] text-slate-600 dark:text-slate-300">
      {children}
    </span>
  )
}

function CodeBlock({ children }) {
  return (
    <pre className="bg-slate-900 dark:bg-[#05060a] border border-slate-800 dark:border-white/[0.08] rounded-2xl p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed shadow-inner">
      <code>{children}</code>
    </pre>
  )
}

function EndpointRow({ method, path, auth, desc }) {
  const color =
    method === 'GET'    ? 'text-emerald-500 dark:text-emerald-400' :
    method === 'POST'   ? 'text-cyan-500 dark:text-cyan-400' :
    method === 'PATCH'  ? 'text-amber-500 dark:text-amber-400' :
    method === 'DELETE' ? 'text-rose-500 dark:text-rose-400' :
    'text-slate-500 dark:text-slate-400'

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 px-5 py-3.5 border-b border-slate-200/70 dark:border-white/[0.07] last:border-0">
      <span className={`font-mono text-xs font-bold w-16 shrink-0 ${color}`}>{method}</span>
      <span className="font-mono text-xs text-slate-800 dark:text-slate-200 flex-1">{path}</span>
      <span className="text-xs font-mono text-slate-500 shrink-0">{auth ? 'Auth' : 'Public'}</span>
      <span className="text-xs text-slate-500 dark:text-slate-400 sm:w-56">{desc}</span>
    </div>
  )
}

export default function ApiDocsPage() {
  useDocumentTitle('API Documentation', 'REST API reference for the DevNest developer portfolio backend.')
  return (
    <div className="relative min-h-screen overflow-hidden">
      <VolumetricBackground variant="profile" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 pt-16 pb-24 space-y-10">
        {/* Header */}
        <div className="glass-panel rounded-3xl p-8">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-light shadow-[0_0_8px_#3cd2bf]" />
            <span className="text-xs font-mono uppercase tracking-widest text-accent dark:text-accent-light">
              Developer Reference
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3 text-slate-900 dark:text-white">
            API Documentation
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
            DevNest exposes a REST API you can use to build integrations, query your portfolio data, or automate workflows.
          </p>
        </div>

        {/* Base URL */}
        <div className="glass-panel rounded-3xl p-8">
          <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Base URL</h2>
          <CodeBlock>https://devnest-api.up.railway.app/api/v1</CodeBlock>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
            All endpoints are prefixed with <code className="font-mono text-xs bg-slate-100 dark:bg-white/[0.06] px-1.5 py-0.5 rounded">/api/v1</code>.
            HTTPS is required for all production requests.
          </p>
        </div>

        {/* Authentication */}
        <div className="glass-panel rounded-3xl p-8 space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Authentication</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Authentication uses <strong className="text-slate-900 dark:text-white">HTTP-only session cookies</strong> set by the login endpoint.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge>POST /auth/login</Badge>
            <Badge>POST /auth/register</Badge>
            <Badge>POST /auth/logout</Badge>
          </div>
          <CodeBlock>{`// Request body (POST /auth/login)
{
  "email": "you@example.com",
  "password": "your-password"
}`}</CodeBlock>
        </div>

        {/* Projects */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Projects</h2>
          <div className="glass-panel rounded-3xl overflow-hidden">
            <EndpointRow method="GET"    path="/projects"             auth={false} desc="List all public projects. Supports ?search= query." />
            <EndpointRow method="GET"    path="/projects/featured"    auth={false} desc="Get featured community projects." />
            <EndpointRow method="GET"    path="/projects/:id"         auth={false} desc="Get a single project by ID." />
            <EndpointRow method="POST"   path="/projects"             auth={true}  desc="Create a new project." />
            <EndpointRow method="PATCH"  path="/projects/:id"         auth={true}  desc="Update a project you own." />
            <EndpointRow method="DELETE" path="/projects/:id"         auth={true}  desc="Delete a project you own." />
            <EndpointRow method="GET"    path="/projects/starred/me"  auth={true}  desc="Get all projects starred by the current user." />
            <EndpointRow method="POST"   path="/projects/:id/star"    auth={true}  desc="Star a project." />
            <EndpointRow method="DELETE" path="/projects/:id/star"    auth={true}  desc="Unstar a project." />
            <EndpointRow method="GET"    path="/projects/:id/comments" auth={false} desc="Get all comments for a project." />
          </div>
        </div>

        {/* Users & Feedback */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Users &amp; Feedback</h2>
          <div className="glass-panel rounded-3xl overflow-hidden">
            <EndpointRow method="GET"    path="/user/:username"          auth={false} desc="Get a public user profile by username." />
            <EndpointRow method="GET"    path="/user/:username/projects" auth={false} desc="Get all public projects for a username." />
            <EndpointRow method="GET"    path="/user/:username/skills"   auth={false} desc="Get skills for a username." />
            <EndpointRow method="PATCH"  path="/user/me"                 auth={true}  desc="Update the authenticated user's profile." />
            <EndpointRow method="GET"    path="/feedback/user/:username" auth={false} desc="Get public feedback for a user." />
            <EndpointRow method="POST"   path="/feedback"                auth={true}  desc="Post feedback on a developer profile." />
          </div>
        </div>
      </div>
    </div>
  )
}
