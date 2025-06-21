from torchvision import transforms
from PIL import Image
from Logo.config import DEVICE

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                         std=[0.229, 0.224, 0.225])
])

def get_embedding(image_path, model):
    img = Image.open(image_path).convert("RGB")
    img_tensor = transform(img).unsqueeze(0).to(DEVICE)
    with torch.no_grad():
        embedding = model(img_tensor).cpu().numpy()
    return embedding
