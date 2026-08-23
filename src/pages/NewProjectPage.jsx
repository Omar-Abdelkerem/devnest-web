import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function NewProjectPage() {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [language, setLanguage] = useState('')
    const [tags, setTags] = useState('')
    const [isPublic, setIsPublic] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

            // Convert comma-separated tags into an array, clean up whitespace
            const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)

            const response = await fetch(`${baseUrl}/api/v1/projects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    title, // Depending on your Prisma schema, this might need to be 'name'
                    description,
                    language,
                    tags: tagsArray,
                    isPublic
                }),
            })

            if (response.ok) {
                // Success! Bounce the user back to their profile to see the new project
                navigate('/profile')
            } else {
                const rawText = await response.text()
                try {
                    const data = JSON.parse(rawText)
                    setError(data.message || data.error?.message || 'Failed to create project')
                } catch {
                    setError(`Server error: ${response.status}`)
                }
            }
        } catch (err) {
            console.error('Project creation error:', err)
            setError('Could not connect to the server.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto px-6 py-12 lg:py-20 w-full">
            <div className="mb-8">
                <Link to="/profile" className="text-sm font-mono text-gray-500 hover:text-white transition-colors">
                    ← Back to profile
                </Link>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-4">
                    Create a new project
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Add a project to your portfolio. You can always edit these details later.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-neutral-800 p-6 md:p-8 rounded-xl shadow-sm">

                {/* Title */}
                <div className="flex flex-col gap-2">
                    <label htmlFor="title" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Project Title</label>
                    <input
                        type="text" id="title" required
                        value={title} onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. prism-db"
                        className="px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-gray-900 dark:text-gray-100"
                    />
                </div>

                {/* Description */}
                <div className="flex flex-col gap-2">
                    <label htmlFor="description" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Description</label>
                    <textarea
                        id="description" required rows="3"
                        value={description} onChange={(e) => setDescription(e.target.value)}
                        placeholder="What does this project do?"
                        className="px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-gray-900 dark:text-gray-100 resize-none"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Primary Language */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="language" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Primary Language</label>
                        <input
                            type="text" id="language"
                            value={language} onChange={(e) => setLanguage(e.target.value)}
                            placeholder="e.g. Rust, Go, TypeScript"
                            className="px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-gray-900 dark:text-gray-100"
                        />
                    </div>

                    {/* Tags */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="tags" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tags (comma separated)</label>
                        <input
                            type="text" id="tags"
                            value={tags} onChange={(e) => setTags(e.target.value)}
                            placeholder="e.g. cli, database, open-source"
                            className="px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-gray-900 dark:text-gray-100"
                        />
                    </div>
                </div>

                {/* Visibility Toggle */}
                <div className="flex items-center gap-3 pt-2">
                    <input
                        type="checkbox" id="isPublic"
                        checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)}
                        className="w-4 h-4 text-accent bg-gray-100 border-gray-300 rounded focus:ring-accent dark:focus:ring-accent dark:ring-offset-neutral-800 dark:bg-neutral-700 dark:border-neutral-600 cursor-pointer"
                    />
                    <label htmlFor="isPublic" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                        Make this project public (visible on the homepage feed)
                    </label>
                </div>

                {/* Error message box */}
                <div className="min-h-6 text-sm text-red-600 dark:text-red-400 empty:hidden font-mono text-xs break-words">
                    {error}
                </div>

                <div className="pt-2">
                    <button
                        type="submit" disabled={isLoading}
                        className="bg-accent hover:bg-accent-light text-white font-semibold px-6 py-2.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {isLoading ? 'Publishing...' : 'Publish Project'}
                    </button>
                </div>
            </form>
        </div>
    )
}