from flask import Flask, request, jsonify
from datetime import datetime
import networkx as nx
import numpy as np
import pickle
from sklearn.metrics.pairwise import cosine_similarity

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
        users = ring['users']
        score = score_ring(G, users)
        nodes, edges = get_subgraph_data(G, users)
        response.append({
            "ring_id": i + 1,
            "users": users,
            "score": score,
            "nodes": nodes,
            "edges": edges
        })

    return jsonify({"status": "success", "top_rings": response})


if __name__ == "__main__":
    app.run(debug=True, port = 8080)
