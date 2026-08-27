export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#161616] text-gray-900 dark:text-gray-100 transition-colors">
      {/* Hero */}
      <div className="max-w-3xl mx-auto px-6 pt-20 pb-12">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-3 h-3 rounded-full bg-accent shadow-sm shadow-accent/50" />
          <span className="text-xs font-mono uppercase tracking-widest text-gray-500">About</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
          Built for developers,<br />
          <span className="text-accent">by developers.</span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl">
          DevNest is an open portfolio platform where software developers can
          showcase their projects, discover work from peers, and get real
          feedback from the community — without noise, without algorithms.
        </p>
      </div>

      <div className="border-t border-gray-100 dark:border-neutral-800" />

      {/* What is DevNest */}
      <div className="max-w-3xl mx-auto px-6 py-14">
        <h2 className="text-2xl font-bold mb-5">What is DevNest?</h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
          DevNest is a developer portfolio and project-sharing platform. Think of it
          as a social layer on top of your side-projects: you publish what you've
          built, link your stack, write a README, and let other developers explore,
          star, and comment on your work.
        </p>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          Unlike a full-blown social network, DevNest stays focused. There are no
          timelines, no ads, and no engagement-bait. Just clean profiles, real code,
          and genuine feedback.
        </p>
      </div>

      <div className="border-t border-gray-100 dark:border-neutral-800" />

      {/* Features */}
      <div className="max-w-3xl mx-auto px-6 py-14">
        <h2 className="text-2xl font-bold mb-8">Features</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {[
            {
              title: 'Project Portfolios',
              desc: 'Showcase your work with a title, description, README, links, and programming languages.',
            },
            {
              title: 'Stars',
              desc: 'Star projects you find impressive and see which of your own have resonated with others.',
            },
            {
              title: 'Discussions',
              desc: 'Leave threaded comments on any public project to ask questions or give feedback.',
            },
            {
              title: 'Explore Feed',
              desc: 'Search for developers by username or browse the community\'s latest public projects.',
            },
            {
              title: 'Privacy Controls',
              desc: 'Mark your profile or individual projects as private whenever you need to.',
            },
            {
              title: 'Dark Mode',
              desc: 'A first-class dark theme that respects your system preference and is toggleable at any time.',
            },
          ].map(({ title, desc }) => (
            <div
              key={title}
              className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-neutral-800 rounded-xl p-5 transition-colors"
            >
              <h3 className="font-bold text-base mb-1 text-gray-900 dark:text-white">{title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100 dark:border-neutral-800" />

      {/* Tech Stack */}
      <div className="max-w-3xl mx-auto px-6 py-14">
        <h2 className="text-2xl font-bold mb-8">Tech Stack</h2>
        <div className="flex flex-wrap gap-3">
          {[
            'Node.js', 'Express', 'PostgreSQL', 'Prisma ORM', 'Redis',
            'React', 'Vite', 'Tailwind CSS', 'Cloudinary', 'Railway', 'Vercel',
          ].map((tech) => (
            <span
              key={tech}
              className="text-sm font-mono px-4 py-2 rounded-full bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100 dark:border-neutral-800" />

      {/* Open source note */}
      <div className="max-w-3xl mx-auto px-6 py-14 pb-24">
        <h2 className="text-2xl font-bold mb-5">Built in the open</h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          DevNest is a passion project built and maintained by its community. It is
          free to use. If you have ideas, bug reports, or want to contribute, the
          best place to start is the{' '}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            GitHub repository
          </a>
          .
        </p>
      </div>
    </div>
  )
}
