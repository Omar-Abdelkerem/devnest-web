import { Link } from 'react-router-dom';

export default function NotFoundPage() {
    return (
        <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center p-8 font-sans text-center">
            <h1 className="text-9xl font-bold text-gray-800 tracking-widest font-mono mb-4">404</h1>
            <div className="bg-[#161b22] border border-gray-800 rounded-lg p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
                {/* Decorative top accent line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>

                <h2 className="text-2xl font-bold text-white mb-2">Page Not Found</h2>
                <p className="text-gray-400 mb-8 text-sm leading-relaxed">
                    The route you are looking for doesn't exist, was moved, or you just spelled it wrong. Don't worry, it happens to the best of us.
                </p>

                <Link
                    to="/"
                    className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 px-6 rounded-md transition-colors duration-200"
                >
                    Return to Home
                </Link>
            </div>
        </div>
    );
}