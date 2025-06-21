import torch
import torch.nn as nn
from torchvision import models
from Logo.config import DEVICE
import ssl

import urllib.request

ssl._create_default_https_context = ssl._create_unverified_context

def get_model():
    model = models.mobilenet_v2(pretrained=True)
    model.classifier = nn.Identity()
    model.eval().to(DEVICE)
    return model