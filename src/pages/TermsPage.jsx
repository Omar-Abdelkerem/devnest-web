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

export default function TermsPage() {
  useDocumentTitle('Terms of Service', 'Terms governing the use of DevNest developer portfolio platform.')
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
            Terms of Service
          </h1>
          <p className="text-xs text-slate-500 font-mono">Last updated: August 2026</p>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm mt-4">
            By accessing or using DevNest, you agree to be bound by these Terms of Service.
          </p>
        </div>

        <Section title="1. Eligibility & Account Security">
          <p>You must be at least 13 years old to use DevNest. You are responsible for maintaining the security of your account credentials and for all activity under your account.</p>
        </Section>

        <Section title="2. Acceptable Use">
          <p>You agree not to post illegal, harassing, or malicious content, upload malware, spam other developers, or scrape platform data via automated means without consent.</p>
        </Section>

        <Section title="3. Your Content">
          <p>You retain full ownership of all projects, code snippets, READMEs, comments, and images you publish on DevNest.</p>
        </Section>

        <Section title="4. Limitation of Liability">
          <p>DevNest is provided &ldquo;as is&rdquo; without warranties of any kind. You may delete your projects or account at any time.</p>
        </Section>
      </div>
    </div>
  )
}
