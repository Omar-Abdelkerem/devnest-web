import { Link } from 'react-router-dom'

export default function ProfileSidebar({ user, isEmpty, isPublicView }) {
  const hasAvatar = !!user?.avatarUrl;

  return (
    <aside className="flex flex-col gap-6 w-full lg:w-80 shrink-0 mb-8 lg:mb-0">
      <div className={`w-full aspect-square max-w-[320px] mx-auto lg:mx-0 rounded-2xl flex items-center justify-center overflow-hidden shadow-sm ${!hasAvatar && isEmpty ? 'border border-dashed border-gray-300 dark:border-neutral-700 bg-transparent' : 'bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700'}`}>
        {hasAvatar ? (
          <img src={user.avatarUrl} alt={user.handle} className="w-full h-full object-cover" />
        ) : isEmpty ? (
          <div className="flex flex-col items-center gap-2 text-gray-500">
            <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <span className="text-sm font-semibold">add photo</span>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-neutral-800 text-gray-400 font-bold text-6xl">
            {user?.handle ? user.handle.charAt(0).toUpperCase() : 'U'}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 text-center lg:text-left">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.name}</h1>
          <p className="text-sm font-mono text-gray-500 dark:text-gray-400">@{user?.handle}</p>
        </div>
        {!isPublicView && (
          <Link to="/settings" className="w-full text-center py-2 px-3 border border-gray-300 dark:border-neutral-700 rounded-md text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
            Edit Profile
          </Link>
        )}
      </div>

      {!user?.bio ? (
        <div className="text-sm text-gray-500 border border-dashed border-gray-300 dark:border-neutral-700 rounded-lg p-4 font-mono text-center lg:text-left">
          Add a description — what you work on, study, and your background.
        </div>
      ) : (
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed text-center lg:text-left">{user.bio}</p>
      )}

      {/* ABOUT ME - ALWAYS VISIBLE */}
      <div className="w-full pt-6 border-t border-gray-200 dark:border-neutral-800 text-left">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse"></span>
          <h4 className="text-xs font-bold tracking-wider text-accent font-mono">
            Soooo...Who's {user?.handle || user?.name || 'profile'} ?
          </h4>
        </div>
        {user?.about ? (
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-sans break-words">{user.about}</p>
        ) : (
          <p className="text-sm text-gray-400 dark:text-gray-500 font-mono italic">No detailed about me added yet.</p>
        )}
      </div>

      {/* SKILLS RENDERED - ALWAYS VISIBLE */}
      <div className="w-full pt-6 border-t border-gray-200 dark:border-neutral-800 text-center lg:text-left">
        <h3 className="text-lg font-black tracking-wide text-gray-800 dark:text-neutral-100 mb-4 font-mono">
          <span className="text-accent">&gt;</span> core_stack()
        </h3>
        {user?.skills && Array.isArray(user.skills) && user.skills.length > 0 ? (
          <div className="flex flex-wrap justify-center lg:justify-start gap-2">
            {user.skills.map((skill, idx) => {
              if (!skill.name) return null;
              return (
                <span
                  key={idx}
                  className="flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300"
                >
                  {skill.name}
                  {skill.level && (
                    <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-neutral-700 px-1 rounded-sm opacity-80">
                      {skill.level}
                    </span>
                  )}
                </span>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-400 dark:text-gray-500 font-mono italic">No skills added yet.</p>
        )}
      </div>

      {/* LINKS - ALWAYS VISIBLE */}
      <div className="w-full pt-6 border-t border-gray-200 dark:border-neutral-800 text-center lg:text-left">
        <h3 className="text-lg font-black tracking-wide text-gray-800 dark:text-neutral-100 mb-4 flex items-center justify-center lg:justify-start gap-2 font-mono">
          <span className="text-accent">&gt;</span> A Few More Places To Find Me...
        </h3>
        {user?.links && user.links.length > 0 ? (
          <ul className="flex flex-col items-center lg:items-start gap-3 text-sm font-medium">
            {user.links.map((link, idx) => {
              const displayUrl = link.replace(/^https?:\/\//, '')
              return (
                <li key={idx} className="flex items-center gap-3 w-full justify-center lg:justify-start">
                  <svg className="w-4 h-4 text-accent shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                  <a href={link.startsWith('http') ? link : `https://${link}`} target="_blank" rel="noreferrer" className="text-accent hover:text-accent-light transition-colors truncate max-w-[220px] font-bold">
                    {displayUrl}
                  </a>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="text-sm text-gray-400 dark:text-gray-500 font-mono italic">No links added yet.</p>
        )}
      </div>
    </aside>
  )
}