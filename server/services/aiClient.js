import axios from 'axios';
import fs from "fs";
import FormData from "form-data";

export const analyzeReview = async (review) => {
    try {
        const response = await axios.post('http://localhost:5001/analyze-review', { review });
        return response.data;
    } catch (error) {
        console.error('AI model error:', error.message);
        throw new Error('Failed to fetch analysis');
    }
};


export const getGraphData = async (productId) => {
    const response = await axios.get("http://localhost:8080/api/rings", {
        params: { product_id: productId }
    });
    return response.data;
};

export const sendImageToAI = async(filePath) => {
    const form = new FormData();
    form.append("image", fs.createReadStream(filePath));

    const response = await axios.post("http://localhost:8001/predict", form, {
        headers: form.getHeaders(),
    });

    return response.data.result;
}
