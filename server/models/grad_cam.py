import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import models, transforms
from PIL import Image
import cv2
import numpy as np

NUM_CLASSES = 3
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
MODEL_WEIGHTS_PATH = "model_weights.pth"
EMBEDDINGS_PATH = "train_embeddings.pt"
LABELS_PATH = "train_labels.pt"
DATA_DIR = "CounterFit/Amazon"

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                        std=[0.229, 0.224, 0.225])
])

class ResNetWithEmbedding(nn.Module):
    def __init__(self, num_classes):
        super().__init__()
        self.model = models.resnet50(pretrained=False)
        self.model.fc = nn.Linear(self.model.fc.in_features, num_classes)
        self.embedding_dim = self.model.fc.in_features

    def forward(self, x, return_embedding=False):
        x = self.model.conv1(x)
        x = self.model.bn1(x)
        x = self.model.relu(x)
        x = self.model.maxpool(x)

        x = self.model.layer1(x)
        x = self.model.layer2(x)
        x = self.model.layer3(x)
        x = self.model.layer4(x)

        self.feature_map = x

        x = self.model.avgpool(x)
        x = torch.flatten(x, 1)

        logits = self.model.fc(x)
        if return_embedding:
            return logits, x
        else:
            return logits

def cosine_similarity_score(embedding1, embedding2):
    embedding1 = F.normalize(embedding1, dim=1)
    embedding2 = F.normalize(embedding2, dim=1)
    return torch.mm(embedding1, embedding2.t())

class GradCAM:
    def __init__(self, model):
        self.model = model
        self.gradients = None
        self.activations = None
        self.hook_handles = []
        self._register_hooks()

    def _register_hooks(self):
        def forward_hook(module, input, output):
            self.activations = output.detach()

        def backward_hook(module, grad_in, grad_out):
            self.gradients = grad_out[0].detach()

        target_layer = self.model.model.layer4[-1].conv3
        self.hook_handles.append(target_layer.register_forward_hook(forward_hook))
        self.hook_handles.append(target_layer.register_backward_hook(backward_hook))

    def remove_hooks(self):
        for handle in self.hook_handles:
            handle.remove()

    def __call__(self, input_tensor, class_idx=None):
        self.model.zero_grad()
        logits, _ = self.model(input_tensor, return_embedding=True)

        if class_idx is None:
            class_idx = logits.argmax(dim=1).item()

        score = logits[:, class_idx]
        score.backward(retain_graph=True)

        gradients = self.gradients
        activations = self.activations

        weights = torch.mean(gradients, dim=(2, 3), keepdim=True)
        cam = torch.sum(weights * activations, dim=1)
        cam = torch.relu(cam)

        cam = cam - cam.min()
        cam = cam / (cam.max() + 1e-8)
        cam = cam.cpu().numpy()

        return cam

def preprocess_image(img_path):
    img = Image.open(img_path).convert("RGB")
    img_tensor = transform(img)
    img_np = np.array(img.resize((224, 224)))
    img_np = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)
    return img_tensor, img_np

def show_cam_on_image(img, mask):
    heatmap = cv2.applyColorMap(np.uint8(255 * mask), cv2.COLORMAP_JET)
    heatmap = np.float32(heatmap) / 255
    img = np.float32(img) / 255
    cam_img = heatmap + img
    cam_img = cam_img / np.max(cam_img)
    return np.uint8(255 * cam_img)

def predict_with_similarity_and_gradcam(model, grad_cam, image_tensor, ref_embeddings, ref_labels, class_names, threshold=0.7):
    model.eval()
    image_tensor = image_tensor.unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        logits, embedding = model(image_tensor, return_embedding=True)
    embedding = embedding.cpu()

    similarities = cosine_similarity_score(embedding, ref_embeddings)
    max_sim, idx = similarities.max(dim=1)

    if max_sim.item() < threshold:
        predicted_class = "Counterfeit or unknown"
    else:
        predicted_class = class_names[ref_labels[idx].item()]

    cam = grad_cam(image_tensor, class_idx=None)[0]
    cam_resized = cv2.resize(cam, (224, 224))

    return predicted_class, max_sim.item(), cam_resized