# DevNest Web

Interactive, high-performance frontend for the **DevNest** developer portfolio platform — built with React 19, Vite 8, Tailwind CSS 4, and React Router 7.

## Highlights
- **Fast First Paint & Zero Blocking**: Non-blocking Google Fonts (`preconnect` + `display=swap`), route-level `React.lazy` code splitting (isolating heavy Markdown chunks), instant rendering of public routes without waiting on session checks, and lightweight client-side GET caching + in-flight request deduplication.
- **Interactive Portfolio Experience (GPU-only, 60fps)**:
  - **Scroll-Linked & 3D-Tilt Profile Photo**: Smooth `requestAnimationFrame`-driven scroll scale/morph and subtle pointer tilt on the sticky profile sidebar (respects `prefers-reduced-motion`).
  - **Interactive Project Cards**: Cover photo preview with hover zoom, elevation lift + scale-up, radial pointer-tracking spotlight glow, and clickable optional project links (Live Demo, GitHub, Docs).
  - **Rich Profile Sidebar**: Displays Location, Age, Role/Title, Company/University, Open-to-Work badge, Joined year, Core Stack, and verified external links.
- **Production Polish & Accessibility**: Unified light/dark design system, full 375px / 768px / 1440px responsiveness, WCAG AA contrast, keyboard navigation (`Escape` menu close, visible focus rings), safe URL validation (`http:`/`https:` only + `rel="noopener noreferrer"`), per-page SEO titles/descriptions, `robots.txt`, `sitemap.xml`, and an on-brand `ErrorBoundary` + 404 page.

## Local Development

```bash
npm install
# Create .env.local with VITE_API_URL=http://localhost:3000 (optional — Vite proxies /api by default)
npm run dev
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite dev server with `/api` proxy to `localhost:3000` |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the project |

## Environment Variables

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Backend API base URL for production deployments (e.g. Render/Railway URL). Leave empty or `http://localhost:3000` locally to use the same-origin Vite proxy. |
