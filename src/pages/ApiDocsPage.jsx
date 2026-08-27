function Badge({ children }) {
  return (
    <span className="inline-flex items-center text-xs font-mono px-2.5 py-1 rounded bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-400">
      {children}
    </span>
  )
}

function CodeBlock({ children }) {
  return (
    <pre className="bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-neutral-800 rounded-lg p-4 text-xs font-mono text-gray-800 dark:text-gray-300 overflow-x-auto leading-relaxed">
      <code>{children}</code>
    </pre>
  )
}

function EndpointRow({ method, path, auth, desc }) {
  const color =
    method === 'GET'    ? 'text-green-600 dark:text-green-400' :
    method === 'POST'   ? 'text-blue-600 dark:text-blue-400' :
    method === 'PATCH'  ? 'text-yellow-600 dark:text-yellow-400' :
    method === 'DELETE' ? 'text-red-500 dark:text-red-400' :
    'text-gray-600 dark:text-gray-400'

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 py-3 border-b border-gray-100 dark:border-neutral-800 last:border-0">
      <span className={`font-mono text-xs font-bold w-16 shrink-0 ${color}`}>{method}</span>
      <span className="font-mono text-xs text-gray-800 dark:text-gray-200 flex-1">{path}</span>
      <span className="text-xs text-gray-500 shrink-0">{auth ? 'Auth' : 'Public'}</span>
      <span className="text-xs text-gray-500 sm:w-56">{desc}</span>
    </div>
  )
}

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#161616] text-gray-900 dark:text-gray-100 transition-colors">
      {/* Header */}
      <div className="max-w-3xl mx-auto px-6 pt-20 pb-10">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-3 h-3 rounded-full bg-accent shadow-sm shadow-accent/50" />
          <span className="text-xs font-mono uppercase tracking-widest text-gray-500">Developer</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight mb-3">API Documentation</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
          DevNest exposes a REST API you can use to build integrations, query your data, or automate workflows.
        </p>
      </div>

      <div className="border-t border-gray-100 dark:border-neutral-800" />

      {/* Base URL */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h2 className="text-xl font-bold mb-4">Base URL</h2>
        <CodeBlock>https://devnest-api.up.railway.app/api/v1</CodeBlock>
        <p className="text-sm text-gray-500 mt-3">
          All endpoints are prefixed with <code className="font-mono text-xs bg-gray-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">/api/v1</code>.
          HTTPS is required for all production requests.
        </p>
      </div>

      <div className="border-t border-gray-100 dark:border-neutral-800" />

      {/* Authentication */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h2 className="text-xl font-bold mb-4">Authentication</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
          Authentication uses <strong className="text-gray-800 dark:text-gray-200">HTTP-only session cookies</strong> set by the login endpoint.
          Include credentials in all requests from a browser context.
          Third-party integrations must first call <code className="font-mono text-xs bg-gray-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">POST /auth/login</code> to obtain a session cookie, then pass it in subsequent calls.
        </p>

        <h3 className="font-bold text-base mb-3">Login</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge>POST /auth/login</Badge>
          <Badge>Content-Type: application/json</Badge>
        </div>
        <CodeBlock>{`// Request body
{
  "email": "you@example.com",
  "password": "your-password"
}

// Response 200 — sets Set-Cookie: session=...
{
  "user": {
    "id": "uuid",
    "username": "yourhandle",
    "email": "you@example.com",
    "avatarUrl": null
  }
}`}</CodeBlock>

        <h3 className="font-bold text-base mt-7 mb-3">Register</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge>POST /auth/register</Badge>
        </div>
        <CodeBlock>{`// Request body
{
  "username": "yourhandle",
  "email": "you@example.com",
  "password": "min-8-chars"
}

// Response 201
{
  "user": { "id": "uuid", "username": "yourhandle", ... }
}`}</CodeBlock>

        <h3 className="font-bold text-base mt-7 mb-3">Logout</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge>POST /auth/logout</Badge>
          <Badge>Requires session</Badge>
        </div>
        <CodeBlock>{`// Response 204 — clears the session cookie`}</CodeBlock>
      </div>

      <div className="border-t border-gray-100 dark:border-neutral-800" />

      {/* Projects */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h2 className="text-xl font-bold mb-6">Projects</h2>
        <div className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-neutral-800 rounded-xl overflow-hidden mb-6">
          <EndpointRow method="GET"    path="/projects"             auth={false} desc="List all public projects. Supports ?search= query." />
          <EndpointRow method="GET"    path="/projects/:id"         auth={false} desc="Get a single project by ID." />
          <EndpointRow method="POST"   path="/projects"             auth={true}  desc="Create a new project." />
          <EndpointRow method="PATCH"  path="/projects/:id"         auth={true}  desc="Update a project you own." />
          <EndpointRow method="DELETE" path="/projects/:id"         auth={true}  desc="Delete a project you own." />
          <EndpointRow method="GET"    path="/projects/starred/me"  auth={true}  desc="Get all projects starred by the current user." />
          <EndpointRow method="POST"   path="/projects/:id/star"    auth={true}  desc="Star a project." />
          <EndpointRow method="DELETE" path="/projects/:id/star"    auth={true}  desc="Unstar a project." />
          <EndpointRow method="GET"    path="/projects/:id/comments" auth={false} desc="Get all comments for a project." />
        </div>

        <h3 className="font-bold text-base mb-3">Example — Create a project</h3>
        <CodeBlock>{`POST /api/v1/projects
Content-Type: application/json

{
  "title": "My CLI Tool",
  "description": "A fast file-watcher written in Go.",
  "readme": "# My CLI Tool\\n\\n...",
  "links": { "github": "https://github.com/you/tool" },
  "isPublic": true,
  "languages": ["Go", "Shell"]
}

// Response 201
{
  "id": "uuid",
  "title": "My CLI Tool",
  "description": "...",
  "isPublic": true,
  "languages": ["Go", "Shell"],
  "stars": 0,
  "hasStarred": false,
  "owner": { "id": "uuid", "username": "yourhandle", "avatarUrl": null }
}`}</CodeBlock>
      </div>

      <div className="border-t border-gray-100 dark:border-neutral-800" />

      {/* Users */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h2 className="text-xl font-bold mb-6">Users</h2>
        <div className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-neutral-800 rounded-xl overflow-hidden mb-6">
          <EndpointRow method="GET"   path="/user/:username"               auth={false} desc="Get a public user profile by username." />
          <EndpointRow method="GET"   path="/user/:username/projects"      auth={false} desc="Get all public projects for a username." />
          <EndpointRow method="PATCH" path="/user/me"                      auth={true}  desc="Update the authenticated user's profile." />
        </div>
      </div>

      <div className="border-t border-gray-100 dark:border-neutral-800" />

      {/* Comments */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h2 className="text-xl font-bold mb-6">Comments</h2>
        <div className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-neutral-800 rounded-xl overflow-hidden">
          <EndpointRow method="POST"   path="/comments"       auth={true}  desc="Post a comment on a project." />
          <EndpointRow method="PATCH"  path="/comments/:id"   auth={true}  desc="Edit your own comment." />
          <EndpointRow method="DELETE" path="/comments/:id"   auth={true}  desc="Delete your own comment." />
        </div>
      </div>

      <div className="border-t border-gray-100 dark:border-neutral-800" />

      {/* Errors */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h2 className="text-xl font-bold mb-4">Error Responses</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
          All errors follow a consistent JSON envelope:
        </p>
        <CodeBlock>{`{
  "message": "Human-readable error description.",
  "status": 404
}

// Common status codes:
// 400 — Bad request / validation error
// 401 — Unauthenticated (no session cookie)
// 403 — Forbidden (wrong user / private resource)
// 404 — Resource not found
// 429 — Rate limited
// 500 — Internal server error`}</CodeBlock>
      </div>

      <div className="border-t border-gray-100 dark:border-neutral-800" />
      <div className="max-w-3xl mx-auto px-6 py-12 pb-24">
        <p className="text-sm text-gray-500">
          This documentation covers the public REST API surface. Internal endpoints may change without notice.
          All API access is subject to rate limiting — 100 requests per 15 minutes per IP.
        </p>
      </div>
    </div>
  )
}
