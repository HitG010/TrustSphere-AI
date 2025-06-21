import torch
import torch.nn as nn
import torch.nn.functional as F
import dgl
from dgl.nn import HeteroGraphConv, GraphConv
from sklearn.metrics import accuracy_score
from generate import simulate  # Make sure generate.py has simulate()

# 1. Simulate data
g = simulate()

# 2. Node types & features
review_feats = g.nodes['review'].data['feat']
review_labels = g.nodes['review'].data['label']

train_mask = torch.zeros_like(review_labels, dtype=torch.bool)
train_mask[:int(0.8 * len(review_labels))] = 1
test_mask = ~train_mask

# 3. Define Hetero R-GCN
class RGCN(nn.Module):
    def __init__(self, in_feats, hidden_feats, out_feats):
        super().__init__()
        self.layers = nn.ModuleList()

        self.layers.append(HeteroGraphConv({
            rel: GraphConv(in_feats, hidden_feats)
            for rel in g.etypes
        }))

        self.layers.append(HeteroGraphConv({
            rel: GraphConv(hidden_feats, out_feats)
            for rel in g.etypes
        }))

    def forward(self, g, inputs):
        h = inputs
        for layer in self.layers:
            h = layer(g, h)
            h = {k: F.relu(v) for k, v in h.items()}
        return h

# 4. Initialize model
model = RGCN(in_feats=16, hidden_feats=32, out_feats=2)

# 5. Optimizer & loss
optimizer = torch.optim.Adam(model.parameters(), lr=0.01)
loss_fn = nn.CrossEntropyLoss()

# 6. Input features (per node type)
features = {
    'user': g.nodes['user'].data['feat'],
    'seller': g.nodes['seller'].data['feat'],
    'product': g.nodes['product'].data['feat'],
    'review': review_feats
}

# 7. Training loop
for epoch in range(100):
    model.train()
    logits = model(g, features)['review']

    loss = loss_fn(logits[train_mask], review_labels[train_mask])
    optimizer.zero_grad()
    loss.backward()
    optimizer.step()

    # Evaluation
    model.eval()
    with torch.no_grad():
        preds = logits.argmax(dim=1)
        acc = accuracy_score(
            review_labels[test_mask].cpu(),
            preds[test_mask].cpu()
        )
    if epoch % 10 == 0:
        print(f"Epoch {epoch:03d} | Loss: {loss.item():.4f} | Test Acc: {acc:.4f}")

