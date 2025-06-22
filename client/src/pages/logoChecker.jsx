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
                headers: { 'Content-Type': 'multipart/form-data' },
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
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setOcrResult(response.data);
            } catch {
            setError('Failed to perform OCR match');
            } finally {
            setLoadingOcr(false);
            }
        };

    return (
        <div className="bg-gray-950 min-h-screen px-6 py-10 text-white">
        <h2 className="text-3xl font-semibold mb-10 text-cyan-300 text-center">Upload Logo Image</h2>

        <div
            className={`flex ${
                logoResult || ocrResult ? 'flex-col md:flex-row' : 'items-center justify-center'
            } gap-8 transition-all duration-500`}
        >
        <div
                className={`${
                logoResult || ocrResult ? 'w-full md:w-1/2' : 'w-full max-w-md'
                } space-y-6 transition-all duration-500`}
        >
            <div
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    file ? 'border-cyan-500 bg-cyan-900' : 'border-gray-700 bg-gray-800'
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
            <p className="text-gray-300">
                {file ? `Selected: ${file.name}` : 'Drag & drop an image here, or click to browse'}
                </p>
                {file && (
                    <img
                    src={URL.createObjectURL(file)}
                    alt="preview"
                    className="mx-auto mt-4 h-32 object-contain rounded-md shadow-lg"
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
                className={`py-3 rounded-full w-full text-lg font-semibold transition-colors ${
                loadingLogo
                    ? 'bg-cyan-800 cursor-not-allowed text-gray-300'
                : 'bg-cyan-500 hover:bg-cyan-400 text-black'
            }`}
            >
                {loadingLogo ? 'Detecting Logo...' : 'Detect Logo'}
            </button>

            <div>
                <label htmlFor="referenceText" className="block mb-1 font-medium text-cyan-200">
                Reference Text for OCR Match
                </label>
                <input
                    id="referenceText"
                    type="text"
                    value={referenceText}
                    onChange={(e) => setReferenceText(e.target.value)}
                    placeholder="Enter expected logo text"
                    className="w-full px-4 py-3 rounded-xl bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button
                    onClick={handleOcrMatch}
                    disabled={loadingOcr}
                    className="mt-3 w-full py-3 bg-green-600 hover:bg-green-500 rounded-xl font-semibold transition-all"
                >
                {loadingOcr ? 'Matching OCR...' : 'Perform OCR Match'}
                </button>
            </div>

            {error && <p className="text-red-500 font-medium">{error}</p>}
            </div>
            
            {(logoResult || ocrResult) && (
            <div className="w-full md:w-1/2 space-y-6">
                {logoResult?.prediction && (
                    <div className="bg-gray-900 border border-cyan-700 rounded-xl p-6 shadow-inner">
                        <h3 className="text-xl font-bold mb-2 text-cyan-300">Logo Detection Result</h3>
                        <div><strong>Detected Brand:</strong> {logoResult.prediction.predicted_label}</div>
                        <div><strong>Similarity Score:</strong> {(logoResult.prediction.similarity_score * 100).toFixed(1)}%</div>
                        <div><strong>Threshold:</strong> {(logoResult.prediction.threshold * 100).toFixed(1)}%</div>
                        <div>
                            <strong>Authentic:</strong>{' '}
                            {logoResult.prediction.authentic ? (
                                <span className="text-green-500 font-semibold">✔ Yes</span>
                                ) : (
                                <span className="text-red-500 font-semibold">✘ No</span>
                                )}
                        </div>
                    </div>
                )}

                {ocrResult?.result && (
                    <div className="bg-gray-900 border border-green-700 rounded-xl p-6 shadow-inner">
                        <h3 className="text-xl font-bold mb-2 text-green-300">OCR Match Result</h3>
                        {ocrResult.result.extracted_text.trim() === '' ? (
                            <div className="text-gray-400">No text detected in the logo image.</div>
                        ) : (
                            <>
                                <div><strong>Extracted Text:</strong> {ocrResult.result.extracted_text}</div>
                                <div><strong>Similarity Score:</strong> {(ocrResult.result.similarity_score * 100).toFixed(1)}%</div>
                                <div>
                                    <strong>Match:</strong>{' '}
                                    {ocrResult.result.match ? (
                                        <span className="text-green-500 font-semibold">✔ Yes</span>
                                        ) : (
                                        <span className="text-red-500 font-semibold">✘ No</span>
                                    )}
                                </div>
                            <div><strong>Threshold:</strong> {(ocrResult.result.threshold * 100).toFixed(1)}%</div>
                            </>
                        )}
                    </div>
                )}
            </div>
        )}
    </div>
    </div>
    );
}


