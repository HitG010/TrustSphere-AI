import torch
import dgl
import numpy as np
import random

# Reproducibility
random.seed(42)
np.random.seed(42)
torch.manual_seed(42)

# Parameters
num_users = 50
num_sellers = 10
num_products = 30
num_reviews = 100

biased_user_groups = [[0, 1, 2], [10, 11, 12]]
biased_seller_groups = [[0, 1], [8, 9]]

def simulate():
    review_src = []  # user → review
    review_dst = []  # review → product
    review_labels = []

    product_seller_edges = []

    user_feats = torch.randn(num_users, 16)
    seller_feats = torch.randn(num_sellers, 16)
    product_feats = torch.randn(num_products, 16)

    biased_review_ids = []

    for i in range(num_reviews):
        is_biased = False

        # Sample a user
        if i < 30:
            group_idx = i // 15  # 0 or 1
            user = random.choice(biased_user_groups[group_idx])
            seller = random.choice(biased_seller_groups[group_idx])
            is_biased = True
        else:
            user = random.randint(0, num_users - 1)
            seller = random.randint(0, num_sellers - 1)

        product = random.randint(0, num_products - 1)

        # Create edges
        review_src.append(user)
        review_dst.append(product)

        product_seller_edges.append((product, seller))

        # Label: 1 = biased/fake, 0 = honest
        review_labels.append(int(is_biased))
        if is_biased:
            biased_review_ids.append(i)

    product_ids, seller_ids = zip(*product_seller_edges)
    graph_data = {
        ('user', 'writes', 'review'): (torch.tensor(review_src), torch.arange(num_reviews)),
        ('review', 'written_by', 'user'): (torch.arange(num_reviews), torch.tensor(review_src)),

        ('review', 'about', 'product'): (torch.arange(num_reviews), torch.tensor(review_dst)),
        ('product', 'about_by', 'review'): (torch.tensor(review_dst), torch.arange(num_reviews)),

        ('product', 'sold_by', 'seller'): (torch.tensor(product_ids), torch.tensor(seller_ids)),
        ('seller', 'sells', 'product'): (torch.tensor(seller_ids), torch.tensor(product_ids)),
    }


    g = dgl.heterograph(graph_data)

    # Assign node features
    g.nodes['user'].data['feat'] = user_feats
    g.nodes['seller'].data['feat'] = seller_feats
    g.nodes['product'].data['feat'] = product_feats
    g.nodes['review'].data['label'] = torch.tensor(review_labels)
    g.nodes['review'].data['feat'] = torch.randn(num_reviews, 16)

    print("Graph Stats:")
    print(g)

    print("\nLabel Distribution (Fake=1):")
    print(f"Fake reviews: {sum(review_labels)}, Real: {num_reviews - sum(review_labels)}")

    return g

# Run
g = simulate()

# print(g)