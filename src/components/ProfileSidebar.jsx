import { Link } from 'react-router-dom'

export default function ProfileSidebar({ user, isEmpty }) {
  return (
    <aside className="flex flex-col gap-6 w-full lg:w-64 shrink-0">

      {/* ── Avatar ──────────────────────────────────────────────── */}
      <div
        className={`
          w-48 h-48 rounded-xl flex items-center justify-center
          ${isEmpty ? 'border border-dashed border-gray-300 dark:border-neutral-700 bg-transparent' : 'bg-gray-200 dark:bg-neutral-800'}
        `}
      >
        {isEmpty ? (
          <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-500">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span className="text-xs">add photo</span>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-emerald-900 text-emerald-400 font-bold text-5xl rounded-xl">
            {user.handle ? user.handle.charAt(0).toUpperCase() : 'U'}
          </div>
        )}
      </div>

      {/* ── Name, Handle & Edit Button ────────────────────────── */}
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{user.name}</h1>
          <p className="text-sm font-mono text-gray-500 dark:text-gray-400">@{user.handle}</p>
        </div>

        {/* NEW: Edit Profile Button */}
        <Link
          to="/settings"
          className="w-full text-center py-1.5 px-3 border border-gray-300 dark:border-neutral-700 rounded-md text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
        >
          Edit Profile
        </Link>
      </div>

      {/* ── Bio ─────────────────────────────────────────────────── */}
      {isEmpty || !user.bio ? (
        <div className="text-sm text-gray-500 dark:text-gray-500 border border-dashed border-gray-300 dark:border-neutral-700 rounded-lg p-4">
          Add a short bio — what you work on, what you're interested in.
        </div>
      ) : (
        <p className="text-sm text-gray-700 dark:text-gray-400 leading-relaxed">
          {user.bio}
        </p>
      )}

      {/* ── Meta Info (Location, Company, Website, Joined) ──────── */}
      <ul className="flex flex-col gap-2.5 text-sm text-gray-600 dark:text-gray-400">
        {user.location && (
          <li className="flex items-center gap-2">
            <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            {user.location}
          </li>
        )}
        {user.company && (
          <li className="flex items-center gap-2">
            <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            Previously: {user.company}
          </li>
        )}
        {user.website && (
          <li className="flex items-center gap-2">
            <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
            <a href={user.website.startsWith('http') ? user.website : `https://${user.website}`} target="_blank" rel="noreferrer" className="hover:text-accent transition-colors">{user.website}</a>
          </li>
        )}
        <li className="flex items-center gap-2">
          <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          Joined {user.joinedYear}
        </li>
      </ul>

      {/* ── Followers ───────────────────────────────────────────── */}
      <div className="flex gap-4 text-sm">
        <span className="text-gray-600 dark:text-gray-400">
          <strong className="text-gray-900 dark:text-gray-100">{user.followers}</strong> followers
        </span>
        <span className="text-gray-600 dark:text-gray-400">
          <strong className="text-gray-900 dark:text-gray-100">{user.following}</strong> following
        </span>
      </div>

      {/* ── Skills ──────────────────────────────────────────────── */}
      <div className="mt-4">
        <h3 className="text-[11px] font-mono uppercase tracking-widest text-gray-500 dark:text-gray-500 mb-3">Skills</h3>
        {isEmpty || !user.skills || user.skills.length === 0 ? (
          <Link to="/settings" className="block text-center text-xs font-mono text-gray-500 dark:text-gray-500 border border-dashed border-gray-300 dark:border-neutral-700 rounded-lg px-4 py-2 w-full hover:text-gray-700 dark:hover:text-gray-300 transition-colors cursor-pointer">
            + Add skills
          </Link>
        ) : (
          <div className="flex flex-wrap gap-2">
            {user.skills?.map((skill) => (
              <span
                key={skill}
                className="text-xs font-mono px-2.5 py-1 rounded bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-400"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}