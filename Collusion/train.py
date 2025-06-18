# train.py

import torch
import torch.nn.functional as F
from torch_geometric.loader import NeighborLoader
from torch_geometric.data import HeteroData
from model import GNN
import pickle

# Load the graph built with build_graph.py
data = torch.load("gnn_review_graph.pt", weights_only=False)

user_input_dim = data["user"].num_nodes  # one-hot
product_input_dim = data["product"].num_nodes  # one-hot
review_input_dim = data["review"].x.size(1)  # 3 + 768 = 771


# Make sure data is on correct device
device = 'mps'
data = data.to(device)

# Create the model
model = GNN(hidden_dim=64, user_input_dim=user_input_dim, review_input_dim=review_input_dim, product_input_dim=product_input_dim).to(device)
optimizer = torch.optim.Adam(model.parameters(), lr=0.005, weight_decay=1e-5)

# Since it's unsupervised, we use a self-supervised loss (e.g., contrastive or reconstruction).
# For simplicity, here we use node reconstruction for review nodes.

# Get review node indices
review_x = data["review"].x
review_indices = torch.arange(review_x.size(0), device=device)

# Train loop
print("Starting training...")
for epoch in range(1, 501):
    model.train()
    optimizer.zero_grad()

    out_dict = model(data.x_dict, data.edge_index_dict)

    # Self-reconstruction loss on review features
    recon = out_dict["review"]
    target = F.normalize(review_x, p=2, dim=-1)  # normalize input
    loss = F.mse_loss(recon, target)

    loss.backward()
    optimizer.step()

    if epoch % 10 == 0:
        print(f"Epoch {epoch:03d}, Loss: {loss.item():.4f}")

# Save trained model
torch.save(model.state_dict(), "gnn_model.pt")
print("Training complete and model saved.")
