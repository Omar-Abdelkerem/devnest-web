function Section({ title, children }) {
  return (
    <>
      <div className="border-t border-gray-100 dark:border-neutral-800" />
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{title}</h2>
        <div className="text-gray-600 dark:text-gray-400 leading-relaxed space-y-4 text-sm">
          {children}
        </div>
      </div>
    </>
  )
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#161616] text-gray-900 dark:text-gray-100 transition-colors">
      {/* Header */}
      <div className="max-w-3xl mx-auto px-6 pt-20 pb-10">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-3 h-3 rounded-full bg-accent shadow-sm shadow-accent/50" />
          <span className="text-xs font-mono uppercase tracking-widest text-gray-500">Legal</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight mb-3">Privacy Policy</h1>
        <p className="text-sm text-gray-500 font-mono">Last updated: August 2026</p>
      </div>

      <div className="border-t border-gray-100 dark:border-neutral-800" />

      <div className="max-w-3xl mx-auto px-6 py-12">
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
          This Privacy Policy explains how DevNest collects, uses, and protects information
          you provide when you use DevNest ("we", "us", "our"). By using DevNest, you agree
          to the practices described below.
        </p>
      </div>

      <Section title="1. Information We Collect">
        <p><strong className="text-gray-800 dark:text-gray-200">Account data:</strong> When you register, we collect your username, email address, and a hashed version of your password. We never store your plain-text password.</p>
        <p><strong className="text-gray-800 dark:text-gray-200">Profile data:</strong> Anything you voluntarily add to your profile — bio, links, avatar image, and skills — is stored and displayed according to your privacy settings.</p>
        <p><strong className="text-gray-800 dark:text-gray-200">Project data:</strong> Project titles, descriptions, READMEs, links, and chosen programming languages are stored on our servers.</p>
        <p><strong className="text-gray-800 dark:text-gray-200">Usage data:</strong> We collect basic server logs (timestamps, request paths, HTTP status codes) to monitor service health. We do not run third-party analytics scripts.</p>
        <p><strong className="text-gray-800 dark:text-gray-200">Cookies:</strong> We set a single HTTP-only session cookie to keep you logged in. We do not use tracking or advertising cookies.</p>
      </Section>

      <Section title="2. How We Use Your Information">
        <p>We use the information we collect to:</p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>Operate and maintain your account and profile.</li>
          <li>Display your projects and profile to other users based on your privacy settings.</li>
          <li>Process comments and stars on projects.</li>
          <li>Detect and prevent abuse or spam.</li>
          <li>Send transactional emails (e.g., password resets) when needed.</li>
        </ul>
        <p>We do not sell, rent, or share your personal data with third parties for marketing purposes.</p>
      </Section>

      <Section title="3. Data Storage and Security">
        <p>All data is stored on infrastructure provided by Railway (database and API) and Vercel (frontend). We use HTTPS for all data in transit and bcrypt for password hashing at rest.</p>
        <p>Profile images are hosted on Cloudinary. By uploading an image, you agree to Cloudinary's terms of service.</p>
        <p>While we take reasonable precautions, no online service is 100% secure. We encourage you to use a unique, strong password for your DevNest account.</p>
      </Section>

      <Section title="4. Publicly Visible Information">
        <p>If your profile and projects are set to <strong className="text-gray-800 dark:text-gray-200">public</strong> (the default), your username, avatar, bio, and public projects are visible to anyone on the internet, including search engines.</p>
        <p>You can switch your profile or individual projects to <strong className="text-gray-800 dark:text-gray-200">private</strong> at any time in your Settings. Private content is not accessible to other users or search engines.</p>
      </Section>

      <Section title="5. Data Retention">
        <p>We retain your account data for as long as your account is active. If you delete your account, your profile, projects, and comments are permanently deleted from our systems within 30 days.</p>
      </Section>

      <Section title="6. Your Rights">
        <p>You may request at any time:</p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li><strong className="text-gray-800 dark:text-gray-200">Access:</strong> a copy of the personal data we hold about you.</li>
          <li><strong className="text-gray-800 dark:text-gray-200">Correction:</strong> an update to inaccurate or incomplete data.</li>
          <li><strong className="text-gray-800 dark:text-gray-200">Deletion:</strong> removal of your account and all associated data.</li>
          <li><strong className="text-gray-800 dark:text-gray-200">Portability:</strong> an export of your project data in JSON format.</li>
        </ul>
        <p>To exercise these rights, reach us through the Explore page or your account settings.</p>
      </Section>

      <Section title="7. Children's Privacy">
        <p>DevNest is not directed to children under the age of 13. We do not knowingly collect personal information from anyone under 13. If you believe a minor has created an account, please contact us immediately.</p>
      </Section>

      <Section title="8. Changes to This Policy">
        <p>We may update this Privacy Policy from time to time. When we do, we will revise the "Last updated" date at the top of this page. Your continued use of DevNest after any change constitutes acceptance of the new policy.</p>
      </Section>

      <div className="border-t border-gray-100 dark:border-neutral-800" />
      <div className="max-w-3xl mx-auto px-6 py-12 pb-24">
        <p className="text-sm text-gray-500">
          Questions about this policy? Open a feedback card on any public profile or reach us through your account settings.
        </p>
      </div>
    </div>
  )
}
