import React, { useState } from 'react';
import axios from 'axios';

export default function LogoUpload() {
    const [file, setFile] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        console.log("Selected file:", selected);
        setFile(e.target.files[0]);
        setResult(null);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select an image file');
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        try {
            setLoading(true);
            setError('');
            console.log("sending request to backend");
            
            const response = await axios.post('http://localhost:5000/api/logo_check', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            console.log( "res: " ,response);
            
            setResult(response.data);
        } catch (err) {
            console.log("error ::", err);
            
            setError('Failed to detect logo');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 max-w-md mx-auto">
            <h2 className="text-xl font-semibold mb-4">Upload Logo Image</h2>
            <form onSubmit={handleSubmit} className="mb-4 flex flex-col justify-center items-center">
                <div
                    className={`border-2 border-dashed rounded p-6 text-center cursor-pointer transition-all ${
                        file ? 'border-green-500 bg-green-50' : 'border-gray-300'
                    }`}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                        e.preventDefault();
                        const droppedFile = e.dataTransfer.files[0];
                        if (droppedFile && droppedFile.type.startsWith('image/')) {
                            setFile(droppedFile);
                            setResult(null);
                            setError('');
                        }
                    }}
                    onClick={() => document.getElementById('fileInput').click()}
                >
                    <p className="text-gray-600">
                        {file ? `Selected: ${file.name}` : 'Drag & drop an image here, or click to browse'}
                    </p>
                    {file && (
                        <img
                            src={URL.createObjectURL(file)}
                            alt="preview"
                            className="mx-auto mt-2 h-32 object-contain"
                        />
                    )}
                </div>

                <input
                    type="file"
                    id="fileInput"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded w-full"
                >
                    {loading ? 'Detecting...' : 'Detect Logo'}
                </button>
            </form>


            {error && <p className="text-red-600">{error}</p>}

            {/* {file && (
                <img
                    src={URL.createObjectURL(file)}
                    alt="Uploaded"
                    className="w-32 h-32 object-contain mb-4 border rounded"
                />
            )} */}


            {result && result.prediction && (
                <div className="bg-white shadow-md rounded p-4 border border-gray-200">
                    <h3 className="text-lg font-bold mb-2">Detection Result</h3>

                    <div className="mb-2">
                        <span className="font-medium">Detected Brand:</span> {result.prediction.predicted_label}
                    </div>

                    <div className="mb-2">
                        <span className="font-medium">Similarity Score:</span>{' '}
                        {(result.prediction.similarity_score * 100).toFixed(1)}%
                    </div>

                    <div className="mb-2">
                        <span className="font-medium">Threshold:</span>{' '}
                        {(result.prediction.threshold * 100).toFixed(1)}%
                    </div>

                    <div className="mb-2">
                        <span className="font-medium">Authentic:</span>{' '}
                        {result.prediction.authentic ? (
                            <span className="text-green-600 font-semibold">✔ Yes</span>
                        ) : (
                            <span className="text-red-600 font-semibold">✘ No</span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
