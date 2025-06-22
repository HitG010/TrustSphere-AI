import axios from 'axios';
import fs from "fs";
import FormData from "form-data";

export const analyzeReview = async (review) => {
    try {
        const payload = {
            title: review.title || "No Title",
            text: review.text,
            metadata: {
                user_id: review.metadata?.user_id || "unknown_user",
                asin: review.metadata?.asin || "unknown_asin",
                timestamp: review.metadata?.timestamp || new Date().toISOString(),
            }
        };
        console.log("Payload sent to AI backend:", payload);

        const response = await axios.post('http://localhost:8080/api/analyze_review', payload);
        console.log("AI server response data:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error calling AI server:", error.message);
        if (error.response) {
            console.error("Response data:", error.response.data);
            console.error("Status code:", error.response.status);
        }
        throw error;
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
