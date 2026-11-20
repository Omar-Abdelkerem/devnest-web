import { useDocumentTitle } from '../hooks/useDocumentTitle'
import VolumetricBackground from '../components/VolumetricBackground'

function Section({ title, children }) {
  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8">
      <h2 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">{title}</h2>
      <div className="text-slate-600 dark:text-slate-300 leading-relaxed space-y-3 text-sm">
        {children}
      </div>
    </div>
  )
}

export default function PrivacyPage() {
  useDocumentTitle('Privacy Policy', 'How DevNest collects, stores, and protects your account and portfolio data.')
  return (
    <div className="relative min-h-screen overflow-hidden">
      <VolumetricBackground variant="profile" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 pt-16 pb-24 space-y-6">
        <div className="glass-panel rounded-3xl p-8">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-light shadow-[0_0_8px_#3cd2bf]" />
            <span className="text-xs font-mono uppercase tracking-widest text-accent dark:text-accent-light">Legal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2 text-slate-900 dark:text-white">
            Privacy Policy
          </h1>
          <p className="text-xs text-slate-500 font-mono">Last updated: August 2026</p>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm mt-4">
            This Privacy Policy explains how DevNest collects, uses, and protects information you provide when you use DevNest.
          </p>
        </div>

        <Section title="1. Information We Collect">
          <p><strong className="text-slate-900 dark:text-white">Account data:</strong> When you register, we collect your username, email address, and a bcrypt-hashed version of your password.</p>
          <p><strong className="text-slate-900 dark:text-white">Profile &amp; Project data:</strong> Bio, links, avatar image, skills, project descriptions, cover photos, and READMEs are stored and displayed according to your privacy settings.</p>
          <p><strong className="text-slate-900 dark:text-white">Cookies:</strong> We set a single HTTP-only session cookie to keep you logged in. We do not use tracking or advertising cookies.</p>
        </Section>

        <Section title="2. How We Use Your Information">
          <p>We use the information we collect to operate your account, display your portfolio according to your visibility controls, process stars and comments, and prevent spam or abuse. We never sell your personal data.</p>
        </Section>

        <Section title="3. Data Storage and Security">
          <p>All data is transmitted over HTTPS and stored on encrypted cloud infrastructure. Uploaded cover and profile images are hosted via Cloudinary.</p>
        </Section>

        <Section title="4. Public and Private Controls">
          <p>You can switch your profile or individual projects between public and private at any time in Settings.</p>
        </Section>
      </div>
    </div>
  )
}
