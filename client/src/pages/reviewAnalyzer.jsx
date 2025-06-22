import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ReviewAnalyzer() {
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [userId, setUserId] = useState('');
    const [asin, setAsin] = useState('');
    const [timestamp, setTimestamp] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);

    const handleAnalyze = async () => {
        if (!text.trim()) {
            setError('Review text is required.');
            return;
        }

        setError('');
        setLoading(true);
        setResult('');

        const reviewPayload = {
            title: title || 'No Title',
            text,
            metadata: {
                user_id: userId || 'unknown_user',
                asin: asin || 'unknown_asin',
                timestamp: timestamp || new Date().toISOString(),
            },
        };

        try {
            const res = await axios.post('http://localhost:5000/api/review', { review: reviewPayload });
            if (res.data.status !== 'success') {
                setError('Error analyzing review');
            } else {
                setResult(res.data.analysis);
                setShowModal(true);
            }
        } catch (e) {
            setError('Failed to analyze review');
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        document.body.style.overflow = showModal ? 'hidden' : 'auto';
    }, [showModal]);

    return (
        <div className="min-h-screen bg-gray-800 flex items-center justify-center px-4 pt-1 pb-18">
            <div className="max-w-2xl mx-auto mt-10 mb-10 px-6 py-8 bg-black text-white rounded-2xl shadow-lg">
            <h2 className="text-4xl font-semibold mb-6 text-center text-cyan-300">Review Analyzer</h2>

            <div className="space-y-4">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Review Title (optional)"
                    className="w-full bg-gray-800 text-white p-3 rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste the review text *"
                    className="w-full h-32 bg-gray-800 text-white p-3 rounded-xl border border-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
                <input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="User ID (optional)"
                    className="w-full bg-gray-800 text-white p-3 rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
                <input
                    type="text"
                    value={asin}
                    onChange={(e) => setAsin(e.target.value)}
                    placeholder="Product ASIN (optional)"
                    className="w-full bg-gray-800 text-white p-3 rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
                <input
                    type="datetime-local"
                    value={timestamp}
                    onChange={(e) => setTimestamp(e.target.value)}
                    className="w-full bg-gray-800 text-white p-3 rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
                <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className={`w-full py-3 text-lg font-semibold rounded-full transition-all duration-200 ${
                        loading
                            ? 'bg-gray-600 cursor-not-allowed'
                            : 'bg-cyan-600 hover:bg-cyan-500 text-black'
                    }`}
                >
                    {loading ? 'Analyzing...' : 'Analyze Review'}
                </button>

                {error && <p className="text-red-400 text-center font-medium mt-4">{error}</p>}
            </div>


            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="bg-gray-900 text-white max-w-xl w-full p-6 rounded-2xl shadow-xl relative">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl font-bold"
                        >
                            &times;
                        </button>
                        <h3 className="text-2xl font-bold mb-4 text-cyan-300 text-center">Analysis Result</h3>
                        <pre className="whitespace-pre-wrap text-gray-200 max-h-[400px] overflow-y-auto">
                            {result}
                        </pre>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
}


