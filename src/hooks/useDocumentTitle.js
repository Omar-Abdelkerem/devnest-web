import { useEffect } from 'react'

const DEFAULT_TITLE = 'DevNest — Your engineering work, in one place.'
const DEFAULT_DESC =
  "DevNest is a portfolio platform for engineers — showcase projects with cover photos and live links, get peer feedback, and build a permanent record of your technical work."

export function useDocumentTitle(title, description) {
  useEffect(() => {
    document.title = title ? `${title} · DevNest` : DEFAULT_TITLE

    const meta = document.querySelector('meta[name="description"]')
    if (meta) {
      meta.setAttribute('content', description || DEFAULT_DESC)
    }

    return () => {
      document.title = DEFAULT_TITLE
    }
  }, [title, description])
}
