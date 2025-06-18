# model.py

import torch
import torch.nn as nn
import torch.nn.functional as F
from torch_geometric.nn import HeteroConv, GATConv, Linear

class GNN(torch.nn.Module):
    def __init__(self, hidden_dim, user_input_dim, review_input_dim, product_input_dim):
        super(GNN, self).__init__()

        # Input linear layers for different node types
        self.lin_dict = nn.ModuleDict({
            'user': Linear(user_input_dim, hidden_dim),
            'product': Linear(product_input_dim, hidden_dim),
            'review': Linear(review_input_dim, hidden_dim),
        })

        self.conv1 = HeteroConv({
            ('user', 'writes', 'review'): GATConv((-1, -1), hidden_dim, add_self_loops=False),
            ('review', 'reviews', 'product'): GATConv((-1, -1), hidden_dim, add_self_loops=False),
            ('product', 'rev_by', 'review'): GATConv((-1, -1), hidden_dim, add_self_loops=False),
            ('review', 'written_by', 'user'): GATConv((-1, -1), hidden_dim, add_self_loops=False),
        }, aggr='sum')

        self.conv2 = HeteroConv({
            ('user', 'writes', 'review'): GATConv((-1, -1), hidden_dim, add_self_loops=False),
            ('review', 'reviews', 'product'): GATConv((-1, -1), hidden_dim, add_self_loops=False),
            ('product', 'rev_by', 'review'): GATConv((-1, -1), hidden_dim, add_self_loops=False),
            ('review', 'written_by', 'user'): GATConv((-1, -1), hidden_dim, add_self_loops=False),
        }, aggr='sum')


    def forward(self, x_dict, edge_index_dict):
        # Apply initial linear layer to each node type
        x_dict = {key: self.lin_dict[key](x) for key, x in x_dict.items()}

        # 2-layer HeteroConv GNN
        x_dict = self.conv1(x_dict, edge_index_dict)
        x_dict = {key: F.relu(x) for key, x in x_dict.items()}
        x_dict = self.conv2(x_dict, edge_index_dict)

        return x_dict
