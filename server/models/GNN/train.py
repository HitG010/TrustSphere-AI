import torch
from torch import nn
from torch_geometric.nn import RGCNConv
from torch_geometric.data import HeteroData
from torch_geometric.nn import to_hetero
from torch_geometric.utils import negative_sampling
from tqdm import tqdm

# Load the graph
data: HeteroData = torch.load("hetero_graph.pt")

# Define a basic R-GCN model
class RGCN(torch.nn.Module):
    def __init__(self, hidden_dim, out_dim):
        super().__init__()
        self.lin_dict = nn.ModuleDict()
        for node_type in data.node_types:
            in_dim = data[node_type].x.size(-1)
            self.lin_dict[node_type] = nn.Linear(in_dim, hidden_dim)

        self.conv1 = RGCNConv(hidden_dim, hidden_dim, num_relations=len(data.edge_types))
        self.conv2 = RGCNConv(hidden_dim, out_dim, num_relations=len(data.edge_types))

    def forward(self, x_dict, edge_index_dict, edge_type_dict):
        # Preprocess input features
        x_dict = {
            node_type: self.lin_dict[node_type](x)
            for node_type, x in x_dict.items()
        }

        # Build homogeneous structure for RGCNConv
        edge_index_all = []
        edge_type_all = []
        for i, (etype, edge_index) in enumerate(edge_index_dict.items()):
            edge_index_all.append(edge_index)
            edge_type_all.append(torch.full((edge_index.size(1),), i, dtype=torch.long))
        
        edge_index = torch.cat(edge_index_all, dim=1)
        edge_type = torch.cat(edge_type_all, dim=0)

        # Flatten all node features into a single tensor
        x_all = torch.cat(list(x_dict.values()), dim=0)

        x = self.conv1(x_all, edge_index, edge_type).relu()
        x = self.conv2(x, edge_index, edge_type)
        return x

# --- Training Setup ---
hidden_dim = 64
out_dim = 32
model = RGCN(hidden_dim, out_dim)
optimizer = torch.optim.Adam(model.parameters(), lr=0.01)
criterion = torch.nn.BCEWithLogitsLoss()

# For unsupervised link prediction: use review-product edges
edge_index = data["review", "about", "product"].edge_index
num_nodes = sum(data[node].x.size(0) for node in data.node_types)

# Dummy labels: assume review-product edges are "1"
def get_edge_batch():
    pos_edge_index = edge_index
    neg_edge_index = negative_sampling(
        edge_index=pos_edge_index,
        num_nodes=num_nodes,
        num_neg_samples=pos_edge_index.size(1)
    )
    return pos_edge_index, neg_edge_index

# --- Training Loop ---
for epoch in range(1, 101):
    model.train()
    optimizer.zero_grad()

    out = model(data.x_dict, data.edge_index_dict, data.edge_type_dict)

    pos_edge_index, neg_edge_index = get_edge_batch()

    # Scores
    pos_scores = (out[pos_edge_index[0]] * out[pos_edge_index[1]]).sum(dim=1)
    neg_scores = (out[neg_edge_index[0]] * out[neg_edge_index[1]]).sum(dim=1)

    labels = torch.cat([torch.ones_like(pos_scores), torch.zeros_like(neg_scores)])
    scores = torch.cat([pos_scores, neg_scores])

    loss = criterion(scores, labels)
    loss.backward()
    optimizer.step()

    print(f"Epoch {epoch} | Loss: {loss.item():.4f}")
