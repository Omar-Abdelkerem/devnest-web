export default function StaticPage({ title }) {
    return (
        <div className="max-w-3xl mx-auto px-6 py-24 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{title}</h1>
            <div className="prose prose-sm dark:prose-invert">
                <p className="text-gray-600 dark:text-gray-400">
                    This documentation is currently being written. Check back later for the full {title.toLowerCase()} details.
                </p>
            </div>
        </div>
    )
}