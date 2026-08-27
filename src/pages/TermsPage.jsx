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

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#161616] text-gray-900 dark:text-gray-100 transition-colors">
      {/* Header */}
      <div className="max-w-3xl mx-auto px-6 pt-20 pb-10">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-3 h-3 rounded-full bg-accent shadow-sm shadow-accent/50" />
          <span className="text-xs font-mono uppercase tracking-widest text-gray-500">Legal</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight mb-3">Terms of Service</h1>
        <p className="text-sm text-gray-500 font-mono">Last updated: August 2026</p>
      </div>

      <div className="border-t border-gray-100 dark:border-neutral-800" />

      <div className="max-w-3xl mx-auto px-6 py-12">
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
          By accessing or using DevNest ("the platform", "we", "us"), you agree to be bound by these
          Terms of Service. Please read them carefully. If you do not agree, do not use DevNest.
        </p>
      </div>

      <Section title="1. Eligibility">
        <p>You must be at least 13 years old to use DevNest. By creating an account, you confirm that you meet this requirement. If you are under 18, you represent that you have your parent or guardian's permission to use the platform.</p>
      </Section>

      <Section title="2. Your Account">
        <p>You are responsible for maintaining the security of your account credentials. Do not share your password with others. You are liable for all activity that occurs under your account.</p>
        <p>Provide accurate information when registering. Impersonating another person or organization is prohibited.</p>
      </Section>

      <Section title="3. Acceptable Use">
        <p>You agree not to use DevNest to:</p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>Post content that is illegal, defamatory, harassing, threatening, or abusive.</li>
          <li>Upload malware, viruses, or any code designed to harm systems or users.</li>
          <li>Spam other users with unsolicited messages or feedback.</li>
          <li>Scrape or harvest data from the platform via automated means without written consent.</li>
          <li>Attempt to gain unauthorized access to any part of the service or its infrastructure.</li>
          <li>Infringe on the intellectual property rights of others.</li>
          <li>Violate any applicable local, national, or international law or regulation.</li>
        </ul>
      </Section>

      <Section title="4. Your Content">
        <p>You retain ownership of all content you post to DevNest — project descriptions, READMEs, comments, profile text, and images.</p>
        <p>By posting content, you grant DevNest a non-exclusive, worldwide, royalty-free license to display and store that content solely for the purpose of operating the platform. We will not sell or license your content to third parties.</p>
        <p>You are solely responsible for the content you post. Do not post content you do not have the right to share.</p>
      </Section>

      <Section title="5. Public and Private Content">
        <p>Public profiles and projects may be indexed by search engines and visible to anyone on the internet. Private profiles and projects are accessible only to you while logged in.</p>
        <p>You control your visibility settings. DevNest is not responsible for content that was public before you changed it to private.</p>
      </Section>

      <Section title="6. Termination">
        <p>You may delete your account at any time through your Settings page. Upon deletion, your data will be permanently removed within 30 days.</p>
        <p>We reserve the right to suspend or terminate accounts that violate these Terms, with or without notice. In serious cases (e.g., illegal activity), termination may be immediate.</p>
      </Section>

      <Section title="7. Limitation of Liability">
        <p>DevNest is provided <strong className="text-gray-800 dark:text-gray-200">"as is"</strong> without warranties of any kind, express or implied. We do not guarantee that the service will be error-free, uninterrupted, or secure.</p>
        <p>To the fullest extent permitted by law, DevNest and its operators shall not be liable for any indirect, incidental, special, or consequential damages arising out of or related to your use of the platform.</p>
      </Section>

      <Section title="8. Changes to These Terms">
        <p>We may update these Terms from time to time. We will post the updated version on this page with a revised date. Continued use of DevNest after changes constitutes acceptance of the new Terms.</p>
      </Section>

      <div className="border-t border-gray-100 dark:border-neutral-800" />
      <div className="max-w-3xl mx-auto px-6 py-12 pb-24">
        <p className="text-sm text-gray-500">
          Questions about these Terms? Reach us through your account settings or the Explore page.
        </p>
      </div>
    </div>
  )
}
