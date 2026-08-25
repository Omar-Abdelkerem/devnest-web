import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { apiFetch } from '../lib/api'

export default function NewProjectPage() {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [readme, setReadme] = useState('')
    // Renamed from `language` (singular string) to `languages` (comma-separated
    // string, converted to an array on submit) — matches the backend's
    // ProjectLanguage join-table support for multiple languages per project,
    // and mirrors the existing `tags` input pattern below.
    const [languages, setLanguages] = useState('')
    const [tags, setTags] = useState('')
    const [isPublic, setIsPublic] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true); setError('')

        try {
            const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
            const languagesArray = languages.split(',').map(lang => lang.trim()).filter(lang => lang.length > 0)

            const response = await apiFetch('/api/v1/projects', {
                method: 'POST',
                body: JSON.stringify({
                    title: title.trim(),
                    description: description.trim(),
                    readme: readme || '',
                    languages: languagesArray,
                    language: languagesArray[0] || null,
                    tags: tagsArray,
                    isPublic,
                }),
            })

            if (response.ok) navigate('/profile')
            else {
                const data = await response.json()
                // Fixed: backend error shape is { error: { message: "..." } },
                // not a top-level "message" field — data.message was always
                // undefined, silently hiding the real backend error.
                setError(data?.error?.message || 'Failed to create project')
            }
        } catch (err) { setError('Could not connect to the server.') }
        finally { setIsLoading(false) }
    }

    return (
        <div className="max-w-2xl mx-auto px-6 py-12 lg:py-20 w-full">
            <div className="mb-8">
                <Link to="/profile" className="text-sm font-mono text-gray-500 hover:text-white transition-colors">← Back to profile</Link>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-4">Create a new project</h1>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-neutral-800 p-6 md:p-8 rounded-xl shadow-sm">

                <div className="flex flex-col gap-2">
                    <label htmlFor="title" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Project Title</label>
                    <input type="text" id="title" required value={title} onChange={(e) => setTitle(e.target.value)} className="px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-gray-900 dark:text-gray-100" />
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="description" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Short Description</label>
                    <textarea id="description" required rows="2" value={description} onChange={(e) => setDescription(e.target.value)} className="px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-gray-900 dark:text-gray-100 resize-none" />
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="readme" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Project Readme (Detailed Info)</label>
                    <textarea id="readme" rows="6" value={readme} onChange={(e) => setReadme(e.target.value)} placeholder="Explain how to install, use, or what you learned..." className="px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-gray-900 dark:text-gray-100" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="languages" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Languages (comma separated)</label>
                        <input type="text" id="languages" placeholder="Rust, Go, TypeScript" value={languages} onChange={(e) => setLanguages(e.target.value)} className="px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-gray-900 dark:text-gray-100" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="tags" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tags (comma separated)</label>
                        <input type="text" id="tags" value={tags} onChange={(e) => setTags(e.target.value)} className="px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-gray-900 dark:text-gray-100" />
                    </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <input type="checkbox" id="isPublic" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="w-4 h-4 text-accent bg-gray-100 border-gray-300 rounded cursor-pointer" />
                    <label htmlFor="isPublic" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">Make this project public</label>
                </div>

                <div className="min-h-6 text-sm text-red-600 empty:hidden">{error}</div>

                <button type="submit" disabled={isLoading} className="bg-accent hover:bg-accent-light text-white font-semibold px-6 py-2.5 rounded-md transition-colors disabled:opacity-50 cursor-pointer">
                    {isLoading ? 'Publishing...' : 'Publish Project'}
                </button>
            </form>
        </div>
    )
}