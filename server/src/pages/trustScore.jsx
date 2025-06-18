import React, { useState } from 'react';
// import axios from 'axios';

const TrustScore = () => {
    const [sellerId, setSellerId] = useState('');
    const [trustScore, setTrustScore] = useState(null);
    // const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // const fetchTrustScore = async () => {
    //     if (!sellerId) {
    //     setError('Please enter a seller ID or name');
    //     return;
    //     }

    //     setLoading(true);
    //     setError('');
    //     setTrustScore(null);

    //     try {
    //     const res = await axios.get(`http://localhost:5000/api/trust/${sellerId}`);
    //     setTrustScore(res.data.trustScore);
    //     } catch (err) {
    //     setError('Failed to fetch trust score');
    //     } finally {
    //     setLoading(false);
    //     }
    // };

    return (
        <div className="p-4 max-w-md mx-auto bg-white rounded-xl shadow-md mt-8">
        <h2 className="text-xl font-semibold mb-4">Check Seller Trust Score</h2>

        <input
            type="text"
            placeholder="Enter seller ID or name"
            value={sellerId}
            onChange={(e) => setSellerId(e.target.value)}
            className="w-full px-4 py-2 border rounded mb-4"
        />

        <button
            // onClick={fetchTrustScore}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
                Get Trust Score 
        </button>

        {/* {error && <p className="text-red-500 mt-4">{error}</p>} */}

        {/* {trustScore !== null && (
            <div className="mt-6 text-center">
            <p className="text-lg font-semibold">Trust Score: <span className="text-blue-600">{trustScore}</span>/100</p>
            <p className="text-sm text-gray-500 mt-1">Based on review patterns, image checks, and trust graph</p>
            </div>
        )} */}
        </div>
    );
};

export default TrustScore;
