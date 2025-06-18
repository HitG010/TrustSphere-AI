import json
from collections import defaultdict
from sklearn.feature_extraction.text import TfidfVectorizer
from transformers import BertTokenizer, BertModel
from tqdm import tqdm
import torch
from torch_geometric.data import HeteroData

# Setup BERT
tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")
bert_model = BertModel.from_pretrained("bert-base-uncased").to('mps')
bert_model.eval()

def bert_embed(text):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=128, padding="max_length")
    inputs = {k: v.to('mps') for k, v in inputs.items()}
    with torch.no_grad():
        outputs = bert_model(**inputs)
    return outputs.last_hidden_state.mean(dim=1)

# --- ID mapping ---
id_maps = defaultdict(dict)
id_counter = defaultdict(int)

def get_id(ntype, raw_id):
    if raw_id not in id_maps[ntype]:
        id_maps[ntype][raw_id] = id_counter[ntype]
        id_counter[ntype] += 1
    return id_maps[ntype][raw_id]

# --- Containers ---
product_titles = []
review_embeds = []
edges = defaultdict(list)
used_product_asins = set()

# --- Step 1: Parse Reviews first (Appliances.json) ---
with open("Appliances.json") as f:
    for i, line in enumerate(tqdm(f, desc="Parsing Reviews")):
        if i >= 10000:
            break
        rev = json.loads(line)
        asin = rev["asin"]
        reviewer = rev["reviewerID"]
        if ("reviewText" not in rev or not rev["reviewText"]):
            continue
        review_text = rev["reviewText"]

        pid = get_id("product", asin)
        uid = get_id("reviewer", reviewer)
        rid = get_id("review", reviewer + "_" + str(rev["unixReviewTime"]))
        used_product_asins.add(asin)

        # BERT embedding for review text
        emb = bert_embed(review_text).squeeze(0).to('mps')
        review_embeds.append((rid, emb))

        # Edges
        edges[("reviewer", "wrote", "review")].append((uid, rid))
        edges[("review", "about", "product")].append((rid, pid))

# --- Step 2: Parse Products (meta_Appliances.json), filter by used_product_asins ---
product_features = {}
with open("meta_Appliances.json") as f:
    for line in tqdm(f, desc="Parsing Products"):
        prod = json.loads(line)
        asin = prod["asin"]
        if asin not in used_product_asins:
            continue

        pid = get_id("product", asin)
        product_titles.append(prod.get("title", ""))

        # Brand edge
        if "brand" in prod:
            bid = get_id("brand", prod["brand"])
            edges[("product", "has_brand", "brand")].append((pid, bid))

        # Category edge
        if "category" in prod and prod["category"]:
            cat = prod["category"][-1]
            cid = get_id("category", cat)
            edges[("product", "in_category", "category")].append((pid, cid))

        # Also_viewed edges (only include if target also in used set)
        for av in prod.get("also_view", []):
            if av in used_product_asins:
                target_id = get_id("product", av)
                edges[("product", "also_viewed", "product")].append((pid, target_id))

# --- Step 3: Build TF-IDF for product titles ---
vectorizer = TfidfVectorizer(max_features=128)
title_matrix = vectorizer.fit_transform(product_titles)
product_features_tensor = torch.tensor(title_matrix.toarray(), dtype=torch.float)

# --- Step 4: Build PyG HeteroData ---
data = HeteroData()

# Product node features
num_products = id_counter["product"]
data["product"].x = product_features_tensor

# Reviewer, Brand, Category nodes
num_reviewers = id_counter["reviewer"]
data["reviewer"].x = torch.eye(num_reviewers)

num_brands = id_counter["brand"]
data["brand"].x = torch.eye(num_brands)

num_categories = id_counter["category"]
data["category"].x = torch.eye(num_categories)

# Review node features
review_embeds.sort(key=lambda x: x[0])  # Sort by review_id
review_feat = torch.stack([emb for _, emb in review_embeds])
data["review"].x = review_feat

# Edges
for (src_type, rel_type, dst_type), pair_list in edges.items():
    src, dst = zip(*pair_list)
    data[(src_type, rel_type, dst_type)].edge_index = torch.tensor([src, dst], dtype=torch.long)

# Save graph
torch.save(data, "hetero_graph.pt")
print("✅ Filtered Hetero graph saved to hetero_graph.pt with only used products")
