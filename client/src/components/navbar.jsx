import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-white shadow-md px-4 py-3 flex justify-center items-center">
        <div className="hidden md:flex gap-6 text-gray-700">
            <Link to="/trustsphere/reviewAnalyzer" className="hover:text-blue-500">Review Analyzer</Link>
            <Link to="/trustsphere/logoChecker" className="hover:text-blue-500">Logo Detection</Link>
            <Link to="/trustsphere/trustGraph" className="hover:text-blue-500">Trust Graph</Link>
            {/* <Link to="/trustsphere/trustScore" className="hover:text-blue-500">Trust Score</Link> */}
        </div>

        {/* <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)}>
            <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
            </svg>
            </button>
        </div> */}

        {/* {isOpen && (
            <div className="absolute top-16 left-0 w-full bg-white shadow-md flex flex-col items-start px-4 py-2 md:hidden z-10">
            <Link to="/dashboard" className="py-2 w-full border-b" onClick={() => setIsOpen(false)}>Dashboard</Link>
            <Link to="/trust-graph" className="py-2 w-full border-b" onClick={() => setIsOpen(false)}>Trust Graph</Link>
            <Link to="/review-analyzer" className="py-2 w-full border-b" onClick={() => setIsOpen(false)}>Review Analyzer</Link>
            <Link to="/image-checker" className="py-2 w-full" onClick={() => setIsOpen(false)}>Image Checker</Link>
            </div>
        )} */}
        </nav>
    );
}
