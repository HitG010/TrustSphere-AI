import React, { useState } from 'react';
import axios from 'axios';

export default function LogoUpload() {
    const [file, setFile] = useState(null);
    const [logoResult, setLogoResult] = useState(null);
    const [ocrResult, setOcrResult] = useState(null);
    const [loadingLogo, setLoadingLogo] = useState(false);
    const [loadingOcr, setLoadingOcr] = useState(false);
    const [error, setError] = useState('');
    const [referenceText, setReferenceText] = useState('');

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        setFile(selected);
        setLogoResult(null);
        setOcrResult(null);
        setError('');
    };

    const handleLogoDetect = async () => {
        if (!file) {
            setError('Please select an image file');
            return;
        }
        setLoadingLogo(true);
        setError('');
        setLogoResult(null);

        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await axios.post('http://localhost:5000/api/logo_check', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setLogoResult(response.data);
        } catch {
            setError('Failed to detect logo');
        } finally {
            setLoadingLogo(false);
        }
    };

    const handleOcrMatch = async () => {
        if (!file) {
            setError('Please select an image file');
            return;
        }
        if (!referenceText.trim()) {
            setError('Please enter reference text for OCR match');
            return;
        }
        setLoadingOcr(true);
        setError('');
        setOcrResult(null);

        const formData = new FormData();
        formData.append('image', file);
        formData.append('referenceText', referenceText);

        try {
            const response = await axios.post('http://localhost:5000/api/ocr_match', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setOcrResult(response.data);
        } catch {
            setError('Failed to perform OCR match');
        } finally {
            setLoadingOcr(false);
        }
    };

    return (
        <div className="p-4 max-w-md mx-auto">
            <h2 className="text-xl font-semibold mb-4">Upload Logo Image</h2>

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
                        setLogoResult(null);
                        setOcrResult(null);
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
                onClick={handleLogoDetect}
                disabled={loadingLogo}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded w-full"
            >
                {loadingLogo ? 'Detecting Logo...' : 'Detect Logo'}
            </button>

            <div className="mt-6">
                <label className="block mb-1 font-medium" htmlFor="referenceText">
                    Reference Text for OCR Match
                </label>
                <input
                    id="referenceText"
                    type="text"
                    value={referenceText}
                    onChange={(e) => setReferenceText(e.target.value)}
                    placeholder="Enter expected logo text"
                    className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
                />
                <button
                    onClick={handleOcrMatch}
                    disabled={loadingOcr}
                    className="px-4 py-2 bg-green-600 text-white rounded w-full"
                >
                    {loadingOcr ? 'Matching OCR...' : 'Perform OCR Match'}
                </button>
            </div>

            {error && <p className="text-red-600 mt-3">{error}</p>}

            {logoResult?.prediction && (
                <div className="bg-white shadow-md rounded p-4 border border-gray-200 mt-6">
                    <h3 className="text-lg font-bold mb-2">Logo Detection Result</h3>
                    <div><strong>Detected Brand:</strong> {logoResult.prediction.predicted_label}</div>
                    <div>
                        <strong>Similarity Score:</strong> {(logoResult.prediction.similarity_score * 100).toFixed(1)}%
                    </div>
                    <div><strong>Threshold:</strong> {(logoResult.prediction.threshold * 100).toFixed(1)}%</div>
                    <div>
                        <strong>Authentic:</strong>{' '}
                        {logoResult.prediction.authentic ? (
                            <span className="text-green-600 font-semibold">✔ Yes</span>
                        ) : (
                            <span className="text-red-600 font-semibold">✘ No</span>
                        )}
                    </div>
                </div>
            )}

            {ocrResult?.result && (
                <div className="bg-white shadow-md rounded p-4 border border-gray-200 mt-6">
                    <h3 className="text-lg font-bold mb-2">OCR Match Result</h3>
                    {ocrResult.result.extracted_text.trim() === '' ? (
                        <div className="text-gray-600">No text detected in the logo image.</div>
                    ) : (
                        <>
                            <div><strong>Extracted Text:</strong> {ocrResult.result.extracted_text}</div>
                            <div>
                                <strong>Similarity Score:</strong> {(ocrResult.result.similarity_score * 100).toFixed(1)}%
                            </div>
                            <div>
                                <strong>Match:</strong>{' '}
                                {ocrResult.result.match ? (
                                    <span className="text-green-600 font-semibold">✔ Yes</span>
                                ) : (
                                    <span className="text-red-600 font-semibold">✘ No</span>
                                )}
                            </div>
                            <div><strong>Threshold:</strong> {(ocrResult.result.threshold * 100).toFixed(1)}%</div>
                        </>
                    )}
                </div>
        )}

        </div>
    );
}

