import { useState } from 'react'
import { Link } from 'react-router-dom'
import { safeExternalUrl } from '../lib/api'

/**
 * Normalizes a WhatsApp phone number or wa.me link into a safe external WhatsApp URL.
 */
function buildWhatsAppUrl(rawWhatsapp, handle = 'developer', projectTitle = '') {
  if (!rawWhatsapp || typeof rawWhatsapp !== 'string') return null
  const trimmed = rawWhatsapp.trim()
  if (!trimmed) return null

  const greeting = projectTitle
    ? `Hi @${handle}, I saw your project "${projectTitle}" on DevNest and wanted to reach out!`
    : `Hi @${handle}, I came across your engineering portfolio on DevNest and wanted to connect!`

  if (/^https?:\/\//i.test(trimmed)) {
    return safeExternalUrl(trimmed)
  }

  const digits = trimmed.replace(/[^\d]/g, '')
  if (digits.length < 7) return null
  return `https://wa.me/${digits}?text=${encodeURIComponent(greeting)}`
}

export default function ContactCTA({
  developer = {},
  isOwner = false,
  projectTitle = '',
  variant = 'profile',
  onLeaveFeedback = null,
}) {
  const [copiedField, setCopiedField] = useState('')

  const handle = developer?.handle || developer?.username || 'developer'
  const displayName = developer?.name || handle
  const phone = developer?.phone?.trim() || ''
  const contactEmail = developer?.contactEmail?.trim() || ''
  const whatsappUrl = buildWhatsAppUrl(developer?.whatsapp || phone, handle, projectTitle)
  const resumeUrl = safeExternalUrl(developer?.resumeUrl || '')

  const rawLinks = Array.isArray(developer?.links) ? developer.links : []
  const validLinks = rawLinks
    .map((l) => safeExternalUrl(typeof l === 'string' ? l : l?.url || l?.href || ''))
    .filter(Boolean)

  const hasDirectContact = Boolean(whatsappUrl || phone || contactEmail || resumeUrl)

  const handleCopy = async (text, label) => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(label)
      setTimeout(() => setCopiedField(''), 2000)
    } catch {
      // Clipboard unavailable
    }
  }

  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-6 relative overflow-hidden">
      {/* Top specular highlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-accent-light/65 to-transparent"
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-accent/15 text-accent dark:text-accent-light border border-accent/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {developer?.availableForWork ? 'Available for opportunities' : 'Direct Contact'}
            </span>
            {developer?.workPreferences && (
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                · {developer.workPreferences}
              </span>
            )}
          </div>

          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
            {variant === 'project'
              ? `Interested in ${projectTitle || 'this project'} or working with @${handle}?`
              : `Want to collaborate or work with ${displayName}?`}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
            {hasDirectContact
              ? 'Reach out directly via WhatsApp, phone, or email for engineering roles, freelance projects, or technical inquiries.'
              : isOwner
                ? 'Add your WhatsApp number, phone, email, or resume link in Settings so recruiters and peers can contact you in one click.'
                : `Connect with @${handle} through their portfolio links or leave a message on their profile.`}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 border border-emerald-400/40 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.35),0_6px_18px_-4px_rgba(16,185,129,0.45)] transition-all hover:-translate-y-0.5"
            >
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zM12 2C6.486 2 2 6.486 2 12c0 1.766.462 3.494 1.335 5.012L2 22l5.132-1.347A9.946 9.946 0 0012 22c5.514 0 10-4.486 10-10S17.514 2 12 2z" />
              </svg>
              <span>WhatsApp</span>
            </a>
          )}

          {phone && (
            <div className="inline-flex items-center rounded-full glass-panel p-0.5">
              <a
                href={`tel:${phone}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-l-full text-xs sm:text-sm font-mono font-semibold text-slate-800 dark:text-slate-100 hover:text-accent dark:hover:text-accent-light transition-colors"
                title={`Call ${phone}`}
              >
                <svg className="w-3.5 h-3.5 text-accent dark:text-accent-light shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>{phone}</span>
              </a>
              <button
                type="button"
                onClick={() => handleCopy(phone, 'phone')}
                className="px-2.5 py-2 rounded-r-full border-l border-slate-200 dark:border-white/[0.08] text-[11px] font-mono text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                title="Copy phone number"
              >
                {copiedField === 'phone' ? 'Copied!' : 'Copy'}
              </button>
            </div>
          )}

          {contactEmail && (
            <div className="inline-flex items-center rounded-full glass-panel p-0.5">
              <a
                href={`mailto:${contactEmail}?subject=${encodeURIComponent(
                  projectTitle ? `Inquiry regarding ${projectTitle} on DevNest` : `Connecting via DevNest (@${handle})`,
                )}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-l-full text-xs sm:text-sm font-mono font-semibold text-slate-800 dark:text-slate-100 hover:text-accent dark:hover:text-accent-light transition-colors"
              >
                <svg className="w-3.5 h-3.5 text-accent dark:text-accent-light shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Email</span>
              </a>
              <button
                type="button"
                onClick={() => handleCopy(contactEmail, 'email')}
                className="px-2.5 py-2 rounded-r-full border-l border-slate-200 dark:border-white/[0.08] text-[11px] font-mono text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                title={`Copy ${contactEmail}`}
              >
                {copiedField === 'email' ? 'Copied!' : 'Copy'}
              </button>
            </div>
          )}

          {resumeUrl && (
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-glass-pill px-4 py-2.5 rounded-full text-xs sm:text-sm font-mono font-semibold"
            >
              <svg className="w-3.5 h-3.5 text-accent dark:text-accent-light shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Resume / CV ↗</span>
            </a>
          )}

          {!hasDirectContact && validLinks.length > 0 && (
            <a
              href={validLinks[0]}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-3d-pill px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold"
            >
              <span>Connect externally ↗</span>
            </a>
          )}

          {variant === 'project' && (
            <Link
              to={`/${handle}`}
              className="btn-glass-pill px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold"
            >
              <span>View @{handle}&apos;s Portfolio →</span>
            </Link>
          )}

          {!hasDirectContact && variant === 'profile' && !isOwner && onLeaveFeedback && (
            <button
              type="button"
              onClick={onLeaveFeedback}
              className="btn-3d-pill px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold cursor-pointer"
            >
              <span>Leave a message →</span>
            </button>
          )}

          {isOwner && (
            <Link
              to="/settings"
              className="btn-glass-pill px-4 py-2 rounded-full text-xs font-mono font-semibold"
            >
              <span>{hasDirectContact ? 'Edit Contact CTA' : '+ Configure Contact CTA'}</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
