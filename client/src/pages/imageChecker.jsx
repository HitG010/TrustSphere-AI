import { useState } from "react";
// import axios from "axios";
// import Loader from "./Loader";

const ImageChecker = () => {
    const [image, setImage] = useState(null);
    // const [result, setResult] = useState(null);
    // const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        setImage(e.target.files[0]);
        // setResult(null);
    };

    // const handleSubmit = async () => {
    //     if (!image) return alert("Please upload an image first.");

    //     const formData = new FormData();
    //     formData.append("image", image);

    //     setLoading(true);
    //     setResult(null);

    //     try {
    //     const res = await axios.post("http://localhost:5000/api/image/check", formData, {
    //         headers: { "Content-Type": "multipart/form-data" },
    //     });
    //     setResult(res.data);
    //     } catch (err) {
    //     console.error(err);
    //     alert("Image analysis failed.");
    //     } finally {
    //     setLoading(false);
    //     }
    // };

    return (
        <div className="p-6 max-w-xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Image Checker</h2>

        <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mb-4"
        />

        {image && (
            <div className="mb-4">
            <p className="text-sm mb-1">Preview:</p>
            <img
                src={URL.createObjectURL(image)}
                alt="Preview"
                className="max-h-64 rounded border"
            />
            </div>
        )}

        <button
            // onClick={handleSubmit}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
            Analyze Image
        </button>

        {/* {loading && <Loader />} */}

        {/* {result && (
            <div className="mt-6 bg-gray-100 p-4 rounded">
            <h4 className="font-medium">Detection Result:</h4>
            <ul className="mt-2 text-sm text-gray-800">
                <li><strong>Is Fake:</strong> {result.is_fake ? "Yes" : "No"}</li>
                <li><strong>Confidence:</strong> {(result.confidence * 100).toFixed(2)}%</li>
                {result.explanation && (
                <li><strong>Explanation:</strong> {result.explanation}</li>
                )}
            </ul>
            </div>
        )} */}
        </div>
    );
};

export default ImageChecker;