import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-black border-b border-gray-700 text-white px-8 py-5 shadow-md">
            <div className="flex gap-4 justify-center text-lg font-medium">
                <Link
                to="/trustsphere/reviewAnalyzer"
                className="px-5 py-2 rounded-full bg-gray-800 hover:bg-gray-700 hover:text-cyan-300 transition duration-200"
                >
                Review Analyzer
                </Link>
                <Link
                to="/trustsphere/logoChecker"
                className="px-5 py-2 rounded-full bg-gray-800 hover:bg-gray-700 hover:text-cyan-300 transition duration-200"
                >
                Logo Detection
                </Link>
                <Link
                to="/trustsphere/trustGraph"
                className="px-5 py-2 rounded-full bg-gray-800 hover:bg-gray-700 hover:text-cyan-300 transition duration-200"
                >
                Trust Graph
                </Link>
            </div>
        </nav>


    );
}
