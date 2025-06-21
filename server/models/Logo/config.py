import torch

DATA_DIR = "data/Amazon"
TEST_IMAGE_PATH = "data/Puma.jpg"
EMBEDDING_FILE = "data/saved_embeddings.npy"
LABEL_FILE = "data/saved_labels.npy"


SIMILARITY_THRESHOLD = 0.9
BATCH_SIZE = 16
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")