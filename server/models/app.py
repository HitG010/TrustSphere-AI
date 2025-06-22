from flask import Flask, request, jsonify
from datetime import datetime
import networkx as nx
import numpy as np
import pickle
from sklearn.metrics.pairwise import cosine_similarity
import torch
from Review_Analysis_LLM.llm_converted import analyze_review
import cv2

app = Flask(__name__)

G = pickle.load(open("review_graph.gpickle", "rb"))

sorted_rings = pickle.load(open("sorted_rings.pkl", "rb"))

def get_subgraph_data(G, users):
    nodes, edges = [], []
    product_nodes = set()

    for user in users:
        product_nodes.update(n for n in G.neighbors(user) if G.nodes[n]['type'] == 'product')
    
    all_nodes = set(users) | product_nodes
    subgraph = G.subgraph(all_nodes)

    for node in subgraph.nodes():
        nodes.append({
            "id": node,
            "type": G.nodes[node].get("type", ""),
            "label": node
        })

    for u, v in subgraph.edges():
        data = G.get_edge_data(u, v)
        ts = data.get("timestamp", None)
        try:
            ts_fmt = datetime.utcfromtimestamp(ts).strftime('%Y-%m-%d') if ts else "N/A"
        except:
            ts_fmt = "Invalid"
        edges.append({
            "source": u,
            "target": v,
            "rating": data.get("rating"),
            "timestamp": ts_fmt,
            "summary": data.get("summary", ""),
            "reviewText": data.get("reviewText", "")[:100]
        })

    return nodes, edges


def score_ring(G, users):
    edges, embeddings = [], []
    products = set()

    for u in users:
        for v in G.neighbors(u):
            if G.nodes[v]['type'] == 'product':
                e = G.get_edge_data(u, v)
                edges.append(e)
                products.add(v)
                if 'embedding' in e:
                    embeddings.append(e['embedding'])

    ratings = [e.get('rating') for e in edges if e.get('rating') is not None]
    timestamps = [e.get('timestamp') for e in edges if e.get('timestamp') is not None]

    rating_std = float(np.std(ratings)) if ratings else 0
    time_std = float(np.std(timestamps)) if timestamps else 0
    sim_score = 0
    if len(embeddings) >= 2:
        sim_matrix = cosine_similarity(embeddings)
        sim_score = float(np.mean(sim_matrix[np.triu_indices_from(sim_matrix, k=1)]))

    return {
        "num_users": len(users),
        "num_products": len(products),
        "rating_std": round(rating_std, 3),
        "time_std": round(time_std, 3),
        "text_similarity": round(sim_score, 3)
    }


def find_rings_with_product(G, product_id):
    if not G.has_node(product_id) or G.nodes[product_id].get('type') != 'product':
        return []

    users = [n for n in G.neighbors(product_id) if G.nodes[n]['type'] == 'user']
    if len(users) < 2:
        return []

    nodes, edges = get_subgraph_data(G, users)
    score = score_ring(G, users)
    return [{
        "product_id": product_id,
        "users": users,
        "score": score,
        "nodes": nodes,
        "edges": edges
    }]


@app.route("/api/rings", methods=["GET"])
def get_rings():
    product_id = request.args.get("product_id")

    if product_id:
        rings = find_rings_with_product(G, product_id)
        if rings:
            return jsonify({"status": "success", "rings": rings})
        else:
            return jsonify({"status": "no_data", "message": f"No suspicious ring found for product {product_id}."})

    # Default: return top 3 suspicious rings
    response = []
    for i, ring in enumerate(sorted_rings[:3]):
        print(ring)
        users = ring['users']
        # products = ring['products']
        score = score_ring(G, users)
        nodes, edges = get_subgraph_data(G, users)
        response.append({
            "ring_id": i + 1,
            "users": users,
            "products": ring["products_reviewed"],
            "score": score,
            "nodes": nodes,
            "edges": edges
        })

    return jsonify({"status": "success", "top_rings": response})



@app.route("/api/analyze_review", methods=["POST"])
def analyze_review_api():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"status": "error", "message": "Missing JSON payload"}), 400

        required_fields = ["title", "text", "metadata"]
        if not all(field in data for field in required_fields):
            return jsonify({"status": "error", "message": "Missing required fields"}), 400

        review = {
            "title": data["title"],
            "text": data["text"],
            "metadata": {
                "user_id": data["metadata"].get("user_id", "unknown_user"),
                "asin": data["metadata"].get("asin", "unknown_asin"),
                "timestamp": data["metadata"].get("timestamp", datetime.now().isoformat())
            }
        }

        result = analyze_review(review)
        return jsonify({
            "status": "success",
            "analysis": result
        })

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

from Logo.model import get_model
from Logo.config import SIMILARITY_THRESHOLD
from Logo.utils.embedding_utils import load_embeddings
from Logo.utils.image_utils import get_embedding
import numpy as np
import tempfile
import os

# Load model and reference embeddings once
model = get_model()
ref_embeddings, ref_labels = load_embeddings(model)

def detect_brand(test_embedding, ref_embeddings, ref_labels, threshold=SIMILARITY_THRESHOLD):
    sims = cosine_similarity(test_embedding, ref_embeddings)[0]
    max_sim_idx = np.argmax(sims)
    max_score = sims[max_sim_idx]
    predicted_label = ref_labels[max_sim_idx]
    is_authentic = bool(max_score >= threshold)

    return {
        "predicted_label": predicted_label,
        "similarity_score": round(float(max_score), 4),
        "authentic": is_authentic,
        "threshold": threshold
    }

@app.route("/api/detect_logo", methods=["POST"])
def detect_logo_from_path():
    data = request.get_json()
    if not data or "image_path" not in data:
        return jsonify({"status": "error", "message": "Missing 'image_path' in request"}), 400

    image_path = data["image_path"]

    if not os.path.exists(image_path):
        return jsonify({"status": "error", "message": f"File not found: {image_path}"}), 404

    try:
        test_embedding = get_embedding(image_path, model)
        print(f"Test embedding shape: {test_embedding.shape}")
        result = detect_brand(test_embedding, ref_embeddings, ref_labels)
        print(f"Detection result: {result}")
        return jsonify({
            "status": "success",
            "prediction": result
        })

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    
    
from difflib import SequenceMatcher
import easyocr


class OCRMatcher:
    def __init__(self, languages=['en'], use_gpu=False, threshold=0.6):
        self.reader = easyocr.Reader(languages, gpu=use_gpu)
        self.threshold = threshold

    def extract_text(self, image_path):
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"File not found: {image_path}")
        result = self.reader.readtext(image_path, detail=0)
        extracted_text = " ".join(result)
        return extracted_text

    def compare_texts(self, ocr_text, reference_text):
        similarity = SequenceMatcher(None, ocr_text.lower(), reference_text.lower()).ratio()
        match = similarity >= self.threshold
        return similarity, match

    def run_match(self, image_path, reference_text):
        ocr_text = self.extract_text(image_path)
        similarity, match = self.compare_texts(ocr_text, reference_text)
        return {
            "extracted_text": ocr_text,
            "similarity_score": round(similarity, 4),
            "match": match,
            "threshold": self.threshold
        }

matcher = OCRMatcher()

@app.route("/api/ocr_match", methods=["POST"])
def ocr_match():
    data = request.get_json()

    if not data or "image_path" not in data or "reference_text" not in data:
        return jsonify({
            "status": "error",
            "message": "Missing required fields: 'image_path' and 'reference_text'"
        }), 400

    image_path = data["image_path"]
    reference_text = data["reference_text"]

    if not os.path.exists(image_path):
        return jsonify({
            "status": "error",
            "message": f"File not found: {image_path}"
        }), 404

    try:
        result = matcher.run_match(image_path, reference_text)
        return jsonify({
            "status": "success",
            "result": result
        })

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500
        
        

from grad_cam import ResNetWithEmbedding, GradCAM, preprocess_image, predict_with_similarity_and_gradcam, show_cam_on_image

# Paths and configs
NUM_CLASSES = 3
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
MODEL_WEIGHTS_PATH = "model_weights.pth"
EMBEDDINGS_PATH = "train_embeddings.pt"
LABELS_PATH = "train_labels.pt"
DATA_DIR = "data/Amazon"
GRADCAM_OUTPUT_DIR = "data/gradcam_outputs"
SIMILARITY_THRESHOLD = 0.7

# Ensure GradCAM output folder exists
os.makedirs(GRADCAM_OUTPUT_DIR, exist_ok=True)

# Load model and data once
grad_model = ResNetWithEmbedding(NUM_CLASSES).to(DEVICE)
grad_model.load_state_dict(torch.load(MODEL_WEIGHTS_PATH, map_location=DEVICE))
grad_model.eval()

grad_ref_embeddings = torch.load(EMBEDDINGS_PATH).to("cpu")
grad_ref_labels = torch.load(LABELS_PATH).to("cpu")
class_names = sorted(os.listdir(DATA_DIR))
grad_cam = GradCAM(grad_model)

@app.route("/api/predict_product_authenticity", methods=["POST"])
def predict_authenticity():
    data = request.get_json()
    if not data or "image_path" not in data:
        return jsonify({"status": "error", "message": "Missing 'image_path' in request."}), 400

    image_path = data["image_path"]
    if not os.path.exists(image_path):
        return jsonify({"status": "error", "message": f"Image not found: {image_path}"}), 404

    try:
        # Preprocess
        img_tensor, img_np = preprocess_image(image_path)

        # Predict + Grad-CAM
        pred_class, sim_score, cam_mask = predict_with_similarity_and_gradcam(
            grad_model, grad_cam, img_tensor, grad_ref_embeddings, grad_ref_labels, class_names, threshold=SIMILARITY_THRESHOLD
        )

        # Save Grad-CAM image
        cam_overlay = show_cam_on_image(img_np, cam_mask)
        output_file = os.path.join(GRADCAM_OUTPUT_DIR, f"gradcam_{os.path.basename(image_path)}")
        cv2.imwrite(output_file, cam_overlay)

        return jsonify({
            "status": "success",
            "predicted_class": pred_class,
            "similarity_score": round(sim_score, 4),
            "gradcam_image_path": output_file
        })

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500



if __name__ == "__main__":
    app.run(debug=True, port = 8080)