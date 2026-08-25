import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../lib/api'

export default function EditProjectPage() {
    const { projectId } = useParams()
    const { user } = useAuth()
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        readme: '',
        // Renamed from `language` (string) to `languages` (comma-separated
        // string in the form, converted to an array on submit) — same
        // reasoning as NewProjectPage.
        languages: '',
        tags: '',
        isPublic: true
    })

    const [isFetching, setIsFetching] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        async function fetchProject() {
            try {
                const response = await apiFetch(`/api/v1/projects/${projectId}`)

                if (response.ok) {
                    const data = await response.json()
                    const project = data.data || data.project || data

                    // Fixed: `project.owner` doesn't exist anywhere in the actual
                    // backend response shape — the only real ownership field is
                    // project.userId. Simplified to that single, correct check.
                    // Note: this is a UX nicety (redirect before showing the form)
                    // — the real enforcement already happens on the backend via
                    // checkProjectOwnership on the PATCH/DELETE routes, so it's
                    // safe even if this check is ever bypassed.
                    if (user.id !== project.userId) {
                        navigate('/profile'); return
                    }

                    setFormData({
                        title: project.title || project.name || '',
                        description: project.description || '',
                        readme: project.readme || '',
                        // The backend flattens projectLanguages -> languages
                        // as an array of plain name strings (see getProjectById
                        // controller) — join them back into a comma-separated
                        // string for this text input.
                        languages: Array.isArray(project.languages) ? project.languages.join(', ') : '',
                        tags: project.tags ? project.tags.join(', ') : '',
                        isPublic: project.isPublic !== undefined ? project.isPublic : true
                    })
                } else setError('Project not found.')
            } catch (err) { setError('Could not connect to the server.') }
            finally { setIsFetching(false) }
        }
        fetchProject()
    }, [projectId, user, navigate])

    const handleUpdate = async (e) => {
        e.preventDefault()
        setIsSaving(true); setError('')

        try {
            const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
            const languagesArray = formData.languages.split(',').map(lang => lang.trim()).filter(lang => lang.length > 0)

            const response = await apiFetch(`/api/v1/projects/${projectId}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                    readme: formData.readme || '',
                    languages: languagesArray,
                    language: languagesArray[0] || null,
                    tags: tagsArray,
                    isPublic: formData.isPublic
                }),
            })

            if (response.ok) navigate(`/project/${projectId}`)
            else {
                // Same error-shape fix as NewProjectPage — read the real
                // backend message instead of a hardcoded generic string.
                const data = await response.json().catch(() => null)
                setError(data?.error?.message || 'Failed to update project')
            }
        } catch (err) { setError('Could not connect to the server.') }
        finally { setIsSaving(false) }
    }

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this project?")) return
        setIsDeleting(true); setError('')
        try {
            const response = await apiFetch(`/api/v1/projects/${projectId}`, { method: 'DELETE' })
            if (response.ok) navigate('/profile')
            else {
                const data = await response.json().catch(() => null)
                setError(data?.error?.message || 'Failed to delete project')
            }
        } catch (err) { setError('Could not connect to server.') }
        finally { setIsDeleting(false) }
    }

    if (isFetching) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>

    return (
        <div className="max-w-2xl mx-auto px-6 py-12 lg:py-20 w-full">
            <div className="mb-8">
                <Link to={`/project/${projectId}`} className="text-sm font-mono text-gray-500 hover:text-white transition-colors">← Back</Link>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-4">Edit Project</h1>
            </div>

            <form onSubmit={handleUpdate} className="flex flex-col gap-6 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-neutral-800 p-6 md:p-8 rounded-xl shadow-sm mb-8">

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Project Title</label>
                    <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-gray-900 dark:text-gray-100" />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Short Description</label>
                    <textarea required rows="2" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-gray-900 dark:text-gray-100 resize-none" />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Project Readme (Detailed Info)</label>
                    <textarea rows="6" value={formData.readme} onChange={(e) => setFormData({ ...formData, readme: e.target.value })} className="px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-gray-900 dark:text-gray-100" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Languages (comma separated)</label>
                        <input type="text" placeholder="Rust, Go, TypeScript" value={formData.languages} onChange={(e) => setFormData({ ...formData, languages: e.target.value })} className="px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-gray-900 dark:text-gray-100" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tags (comma separated)</label>
                        <input type="text" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} className="px-3 py-2 bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-gray-900 dark:text-gray-100" />
                    </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <input type="checkbox" checked={formData.isPublic} onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })} className="w-4 h-4 text-accent bg-gray-100 border-gray-300 rounded cursor-pointer" />
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">Make this project public</label>
                </div>

                <div className="min-h-6 text-sm text-red-600 empty:hidden">{error}</div>

                <button type="submit" disabled={isSaving || isDeleting} className="bg-accent hover:bg-accent-light text-white font-semibold px-6 py-2.5 rounded-md transition-colors disabled:opacity-50 cursor-pointer">
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </form>

            {/* Danger Zone */}
            <div className="border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 p-6 md:p-8 rounded-xl shadow-sm">
                <h2 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">Danger Zone</h2>
                <button type="button" onClick={handleDelete} disabled={isSaving || isDeleting} className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2.5 rounded-md transition-colors disabled:opacity-50 cursor-pointer">
                    {isDeleting ? 'Deleting...' : 'Delete Project'}
                </button>
            </div>
        </div>
    )
}