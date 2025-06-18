import { useState } from 'react';
// import Loader from './Loader';

export default function ReviewAnalyzer() {
    const [review, setReview] = useState('');
    // const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [product, setProduct] = useState("");

    // Once models are set-up

    // const handleAnalyze = async () => {
    //     if (!review.trim()) return;
    //     setLoading(true);
    //     setResult(null);

    //     try {
    //     const res = await fetch('http://localhost:5000/api/review/analyze', {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({ review, product}),
    //     });

    //     const data = await res.json();
    //     setResult(data);
    //     } catch (err) {
    //     console.error(err);
    //     setResult({ error: 'Failed to analyze review.' });
    //     } finally {
    //     setLoading(false);
    //     }
    // };

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-4">Analyze a review</h2>
        <input
            type="text"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            placeholder="Enter product name or ID"
            className="w-full p-2 mb-4 border rounded"
        />
        <textarea
            className="w-full h-40 p-4 border rounded resize-none focus:outline-none focus:ring"
            placeholder="Paste the review ..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
        />

        <button
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            // onClick={handleAnalyze}
            // disabled={loading}
        >
            Analyze
        </button>

        {/* {loading && <Loader />} */}

        {/* {result && !result.error && (
            <div className="mt-6 bg-white shadow p-4 rounded">
            <p><strong>Trust Score:</strong> {result.score}/100</p>
            <p className="mt-2"><strong>Explanation:</strong> {result.explanation}</p>
            </div>
        )}

        {result?.error && (
            <div className="mt-4 text-red-600">{result.error}</div>
        )} */}
        </div>
    );
}
