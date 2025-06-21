import { useState } from 'react';
import axios from 'axios';

export default function ReviewAnalyzer() {
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [userId, setUserId] = useState('');
    const [asin, setAsin] = useState('');
    const [timestamp, setTimestamp] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState("");
    const [error, setError] = useState('');

    const handleAnalyze = async () => {
        if (!text.trim()) {
            setError('Review text is required.');
            return;
        }
        setError('');
        setLoading(true);
        setResult("");

        const reviewPayload = {
            title: title || 'No Title',
            text,
            metadata: {
                user_id: userId || 'unknown_user',
                asin: asin || 'unknown_asin',
                timestamp: timestamp || new Date().toISOString(),
            },
        };
        console.log("Sending review payload:", reviewPayload);
        try {
            
            const res = await axios.post('http://localhost:5000/api/review', {review: reviewPayload});
            console.log("Request sent successfully");
            
            console.log(res);
            if (res.data.status !== "success") {
                console.log(res);
                setError('Error analyzing review');
            } else {
                setResult(res.data.analysis);
            }
        } catch (e) {
            console.log("frontend error", e);
            setError('Failed to analyze review');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-6 py-8 bg-gray-50 rounded shadow">
        <h2 className="text-3xl font-semibold mb-6 text-gray-800">Analyze a Review</h2>

        <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Review Title (optional)"
            className="w-full p-3 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <textarea
            className="w-full h-32 p-3 mb-4 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Paste the review text *"
            value={text}
            onChange={(e) => setText(e.target.value)}
        />

        <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="User ID (optional)"
            className="w-full p-3 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
            type="text"
            value={asin}
            onChange={(e) => setAsin(e.target.value)}
            placeholder="Product ASIN (optional)"
            className="w-full p-3 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
            type="datetime-local"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
            placeholder="Review timestamp (optional)"
            className="w-full p-3 mb-6 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
            onClick={handleAnalyze}
            disabled={loading}
            className={`w-full py-3 text-white font-semibold rounded ${
            loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
        >
            {loading ? 'Analyzing...' : 'Analyze'}
        </button>

        {error && <p className="mt-4 text-red-600 font-medium">{error}</p>}

        {result && !error && (
            <div className="mt-6 p-4 bg-white border border-gray-200 rounded shadow-sm">
            <pre className="whitespace-pre-wrap text-gray-800">{result}</pre>
            </div>
        )}
    </div>);
}