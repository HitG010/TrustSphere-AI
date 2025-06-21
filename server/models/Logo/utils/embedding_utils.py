import os
import torch
import numpy as np
from torch.utils.data import DataLoader
from torchvision import datasets
from Logo.config import DATA_DIR, BATCH_SIZE, EMBEDDING_FILE, LABEL_FILE, DEVICE
from Logo.utils.image_utils import transform

def extract_and_save_embeddings(model):
    dataset = datasets.ImageFolder(DATA_DIR, transform=transform)
    dataloader = DataLoader(dataset, batch_size=BATCH_SIZE, shuffle=False)
    class_names = dataset.classes

    all_embeddings, all_labels = [], []
    with torch.no_grad():
        for images, labels in dataloader:
            images = images.to(DEVICE)
            embeddings = model(images).cpu().numpy()
            all_embeddings.append(embeddings)
            all_labels.extend([class_names[i] for i in labels])

    all_embeddings = np.vstack(all_embeddings)
    all_labels = np.array(all_labels)

    np.save(EMBEDDING_FILE, all_embeddings)
    np.save(LABEL_FILE, all_labels)

    return all_embeddings, all_labels

def load_embeddings(model):
    if os.path.exists(EMBEDDING_FILE) and os.path.exists(LABEL_FILE):
        embeddings = np.load(EMBEDDING_FILE)
        labels = np.load(LABEL_FILE)
    else:
        embeddings, labels = extract_and_save_embeddings(model)
    return embeddings, labels
