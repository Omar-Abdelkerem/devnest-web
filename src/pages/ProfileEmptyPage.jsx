/**
 * ProfileEmptyPage.jsx — Assembles the empty profile state for a new user
 */

import ProfileSidebar from '../components/ProfileSidebar'
import ProfileTabs from '../components/ProfileTabs'
import ProfileEmptyState from '../components/ProfileEmptyState'

export default function ProfileEmptyPage() {
  const aleksaData = {
    name: 'Aleksa Vukovic',
    handle: 'aleksa-v',
    location: 'Zagreb, HR',
    joinedYear: '2026',
    followers: '0',
    following: '0',
    skills: [], // triggers empty state in sidebar
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12 bg-white dark:bg-[#161616]">
      <ProfileSidebar user={aleksaData} isEmpty={true} />
      <div className="flex-1 min-w-0">
        <ProfileTabs projectCount={0} />
        <ProfileEmptyState />
      </div>
    </div>
  )
}
