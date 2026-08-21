import { useState } from 'react';

export default function ProjectDetailsPage() {
    const [activeTab, setActiveTab] = useState('discussion'); // 'readme' or 'discussion'

    return (
        <div className="min-h-screen bg-[#0d1117] text-gray-300 font-sans p-8">
            <div className="max-w-6xl mx-auto">

                {/* --- HEADER --- */}
                <header className="mb-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="text-emerald-500 font-mono text-sm mb-2">
                                maren-k <span className="text-gray-500">/</span> <span className="text-white font-bold">forge-cli</span>
                                <span className="ml-3 border border-gray-700 text-gray-400 px-1.5 py-0.5 rounded text-xs">v0.8.3</span>
                            </div>
                            <h1 className="text-4xl font-bold text-white mb-4">forge-cli</h1>
                            <p className="max-w-2xl text-lg text-gray-400 mb-4">
                                A zero-config deployment tool for monorepos. Detects changed packages using a content-addressed cache, builds only what's needed, and streams logs in real time over WebSockets.
                            </p>

                            {/* Meta Info */}
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#dea584]"></span> Rust</span>
                                <span>MIT</span>
                                <span>14 open issues</span>
                                <span>Updated 3 days ago</span>
                                <span>Created Jan 2024</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button className="flex items-center gap-2 bg-[#21262d] border border-gray-700 hover:border-gray-500 text-white px-4 py-1.5 rounded-md text-sm transition-colors">
                                <span>☆</span> Star <span className="text-gray-400 ml-1">· 847</span>
                            </button>
                            <button className="flex items-center gap-2 bg-[#21262d] border border-gray-700 hover:border-gray-500 text-white px-4 py-1.5 rounded-md text-sm transition-colors">
                                <span>⑂</span> Fork <span className="text-gray-400 ml-1">· 62</span>
                            </button>
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-6">
                        {['Rust', 'Tokio', 'WebSockets', 'Docker', 'Redis', 'nix'].map(tag => (
                            <span key={tag} className="bg-[#21262d] border border-gray-700 text-gray-400 px-3 py-1 rounded-md text-sm">
                                {tag}
                            </span>
                        ))}
                    </div>
                </header>

                {/* --- MAIN GRID LAYOUT --- */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">

                    {/* Left Column (Content) */}
                    <div className="lg:col-span-3">

                        {/* Tabs Navigation */}
                        <div className="flex gap-6 border-b border-gray-800 mb-6">
                            <button
                                onClick={() => setActiveTab('readme')}
                                className={`pb-3 text-sm font-medium transition-colors ${activeTab === 'readme' ? 'text-white border-b-2 border-emerald-500' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                README
                            </button>
                            <button
                                onClick={() => setActiveTab('discussion')}
                                className={`pb-3 text-sm font-medium transition-colors ${activeTab === 'discussion' ? 'text-white border-b-2 border-emerald-500' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                Discussion (4)
                            </button>
                        </div>

                        {/* Tab Content: README */}
                        {activeTab === 'readme' && (
                            <div className="space-y-8 text-gray-300">
                                <section>
                                    <h2 className="text-xl font-bold text-white mb-4 border-b border-gray-800 pb-2">Overview</h2>
                                    <p className="leading-relaxed">
                                        <code className="bg-[#21262d] px-1.5 py-0.5 rounded text-sm text-gray-200">forge-cli</code> solves a common monorepo pain: full rebuilds on every deploy, even when only one package changed. It maintains a content-addressed cache keyed to each package's dependency graph, rebuilds only affected packages, and streams build output back to the terminal in real time.
                                    </p>
                                </section>
                                <section>
                                    <h2 className="text-xl font-bold text-white mb-4 border-b border-gray-800 pb-2">Architecture</h2>
                                    <p className="mb-4">The CLI delegates to a local daemon (<code className="bg-[#21262d] px-1.5 py-0.5 rounded text-sm text-gray-200">forged</code>) that tracks file change events via inotify/kqueue. On each deploy:</p>
                                    <ol className="list-decimal list-inside space-y-2">
                                        <li>Walk the dependency graph from the changed files</li>
                                        <li>Compute a cache key from the content hash + dependency hashes</li>
                                        <li>Pull a cached artifact if available, or run the build</li>
                                        <li>Push the artifact to the configured registry (Docker Hub, ECR, or a local cache)</li>
                                    </ol>
                                </section>
                            </div>
                        )}

                        {/* Tab Content: DISCUSSION */}
                        {activeTab === 'discussion' && (
                            <div className="space-y-4">

                                {/* Discussion Thread 1 */}
                                <div className="border border-gray-800 rounded-lg p-5 bg-[#0d1117]">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-gray-700 flex items-center justify-center text-xs font-bold text-white">TA</div>
                                            <div>
                                                <span className="font-semibold text-gray-200 mr-2">Tariq Al-Amin</span>
                                                <span className="text-xs text-gray-500">Senior Engineer @ Stripe</span>
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-500">2 days ago</span>
                                    </div>
                                    <p className="text-gray-300 text-sm leading-relaxed mb-4">
                                        Really clean approach on the cache invalidation. One question: how are you handling the case where a package has side effects that aren't captured by its dependency graph? I've hit that with generated code in similar tools.
                                    </p>
                                    <button className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1">
                                        <span>👍</span> 12 Reply
                                    </button>
                                </div>

                                {/* Author Reply */}
                                <div className="border border-gray-800 rounded-lg p-5 bg-[#161b22] ml-8">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-emerald-900 flex items-center justify-center text-xs font-bold text-emerald-400">MK</div>
                                            <div>
                                                <span className="font-semibold text-gray-200 mr-2">Maren Kowalski</span>
                                                <span className="text-xs border border-emerald-900 text-emerald-500 px-1.5 py-0.5 rounded">author</span>
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-500">2 days ago</span>
                                    </div>
                                    <p className="text-gray-300 text-sm leading-relaxed">
                                        Good catch. Right now forge doesn't try to infer side effects — you declare them in the `forge.toml` under `[side-effects]`. It's a manual escape hatch but it keeps the model simple. Happy to hear if you have a better idea.
                                    </p>
                                </div>

                                {/* Discussion Thread 2 */}
                                <div className="border border-gray-800 rounded-lg p-5 bg-[#0d1117]">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-gray-700 flex items-center justify-center text-xs font-bold text-white">PN</div>
                                            <div>
                                                <span className="font-semibold text-gray-200 mr-2">Priya Nambiar</span>
                                                <span className="text-xs text-gray-500">Platform Engineer @ Linear</span>
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-500">1 day ago</span>
                                    </div>
                                    <p className="text-gray-300 text-sm leading-relaxed mb-4">
                                        The inotify/kqueue abstraction is nice. One architectural concern: the daemon approach means users have to manage another long-running process. Have you considered a file-lock + check-on-demand model instead? Might simplify the ops story considerably.
                                    </p>
                                    <button className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1">
                                        <span>👍</span> 8 Reply
                                    </button>
                                </div>

                                {/* New Comment Box */}
                                <div className="border border-gray-800 rounded-lg p-4 bg-[#0d1117] mt-8">
                                    <h3 className="text-sm font-semibold text-gray-300 mb-3">Leave a review</h3>
                                    <textarea
                                        className="w-full bg-[#161b22] border border-gray-700 rounded-md p-3 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-emerald-500 min-h-[100px] mb-3"
                                        placeholder="Share your thoughts on the architecture, implementation, or tradeoffs..."
                                    ></textarea>
                                    <div className="flex justify-end">
                                        <button className="bg-[#21262d] border border-gray-700 hover:border-gray-500 text-white px-4 py-1.5 rounded-md text-sm transition-colors">
                                            Submit review
                                        </button>
                                    </div>
                                </div>

                            </div>
                        )}
                    </div>

                    {/* Right Column (Sidebar) */}
                    <div className="lg:col-span-1 space-y-8">

                        <section>
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">About</h3>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                A zero-config deployment tool for monorepos. Detects changed packages using a content-addressed cache, builds only what's needed, and streams logs in real time over WebSockets.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Author</h3>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded bg-emerald-900 flex items-center justify-center text-sm font-bold text-emerald-400">MK</div>
                                <div>
                                    <div className="font-semibold text-gray-200 text-sm">Maren Kowalski</div>
                                    <div className="text-xs text-gray-500">maren-k</div>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Stats</h3>
                            <ul className="space-y-3 text-sm">
                                <li className="flex justify-between"><span className="text-gray-400">Stars</span> <span className="font-semibold text-gray-200">847</span></li>
                                <li className="flex justify-between"><span className="text-gray-400">Forks</span> <span className="font-semibold text-gray-200">62</span></li>
                                <li className="flex justify-between"><span className="text-gray-400">Watchers</span> <span className="font-semibold text-gray-200">93</span></li>
                                <li className="flex justify-between"><span className="text-gray-400">Open issues</span> <span className="font-semibold text-gray-200">14</span></li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Releases</h3>
                            <ul className="space-y-3 text-sm">
                                <li className="flex gap-2 items-center">
                                    <span className="text-emerald-500 font-mono">v0.8.3</span>
                                    <span className="text-gray-500 text-xs">· latest</span>
                                </li>
                                <li className="text-gray-500 font-mono">v0.8.0</li>
                                <li className="text-gray-500 font-mono">v0.7.5</li>
                            </ul>
                        </section>

                    </div>
                </div>
            </div>
        </div>
    );
}