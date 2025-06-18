# detect_collusion.py

import torch
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import DBSCAN
from collections import defaultdict
import matplotlib.pyplot as plt
from torch_geometric.data import HeteroData

# Load node embeddings
embeddings = torch.load("node_embeddings.pt", weights_only=False)
embeddings = embeddings.detach().cpu().numpy()

# Load original heterogeneous graph
data = torch.load("gnn_review_graph.pt", weights_only=False)

# Get number of user and product nodes
num_users = data["user"].num_nodes
num_products = data["product"].num_nodes

# Split user and product node embeddings
user_embs = embeddings[:num_users]
product_embs = embeddings[num_users:num_users + num_products]

# Step 1: Cosine similarity between user embeddings
user_sim = cosine_similarity(user_embs)

# Step 2: Clustering suspiciously similar users
user_clusters = DBSCAN(eps=0.9, min_samples=2, metric='precomputed').fit(1 - user_sim)
user_labels = user_clusters.labels_

# Step 3: Map users to products they've rated
user2products = defaultdict(set)
edge_index = data["user", "rates", "product"].edge_index
for u, p in zip(edge_index[0], edge_index[1]):
    user2products[int(u.item())].add(int(p.item()))

# Step 4: Detect collusion
collusive_groups = []
for label in set(user_labels):
    if label == -1:
        continue
    group_users = [i for i, l in enumerate(user_labels) if l == label]
    product_sets = [user2products[u] for u in group_users]
    if not product_sets:
        continue
    common_products = set.intersection(*product_sets)
    if common_products:
        collusive_groups.append({"users": group_users, "products": list(common_products)})

# Output
print("Potential collusive groups:")
for group in collusive_groups:
    print("Users:", group["users"])
    print("Common Products:", group["products"])
    print("-")

plt.hist(user_sim[np.triu_indices_from(user_sim, k=1)], bins=50)
plt.title("User-User Cosine Similarity Distribution")
plt.xlabel("Cosine similarity")
plt.ylabel("Frequency")
plt.show()
