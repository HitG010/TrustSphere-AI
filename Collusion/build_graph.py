import json
import pandas as pd
import networkx as nx
from sentence_transformers import SentenceTransformer
from tqdm import tqdm
import pickle


# Load SentenceTransformer model
model = SentenceTransformer('all-MiniLM-L6-v2')# Ensure the model is on the correct device

# Step 1: Load Data
def load_reviews(json_file_path):
    with open(json_file_path, 'r') as f:
        data = [json.loads(line) for line in f]
    return pd.DataFrame(data)

# Step 2: Embed Review Texts
def generate_embeddings(df):
    print("Generating embeddings...")
    tqdm.pandas()
    df['reviewEmbedding'] = df['reviewText'].progress_apply(lambda text: model.encode(text) if isinstance(text, str) else model.encode(""))
    return df

# Step 3: Build Graph
def build_graph(df):
    G = nx.Graph()
    print("Building graph...")

    for _, row in tqdm(df.iterrows(), total=len(df)):
        user_node = f"user_{row['reviewerID']}"
        product_node = f"product_{row['asin']}"

        # Add user and product nodes
        G.add_node(user_node, type='user')
        G.add_node(product_node, type='product')

        # Add edge with review metadata
        G.add_edge(
            user_node,
            product_node,
            rating=row.get('overall', None),
            verified=row.get('verified', False),
            timestamp=row.get('unixReviewTime', None),
            summary=row.get('summary', ""),
            embedding=row.get('reviewEmbedding', []).tolist()  # Convert NumPy to list
        )
    return G


def save_graph(G, path="review_graph.gpickle"):
    with open(path, 'wb') as f:
        pickle.dump(G, f)
    print(f"Graph saved to {path}")


# -------- Main Entry --------
if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--json", required=True, help="Path to the JSON review file")
    args = parser.parse_args()

    # Load and process
    df = load_reviews(args.json)
    df = generate_embeddings(df)
    G = build_graph(df)
    save_graph(G)
