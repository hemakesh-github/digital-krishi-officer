import os
import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image


class DiseasePrediction:

    def __init__(self, model_path: str = None):
        if model_path is None:
            # Try multiple paths
            possible_paths = [
                os.path.join(os.path.dirname(__file__), "best_model.pth"),
                os.path.join(os.path.dirname(__file__), "..", "diseasePrediction", "best_model.pth"),
                os.path.join(os.path.dirname(__file__), "..", "..", "models", "diseaseModel", "best_model.pth"),
            ]
            for path in possible_paths:
                if os.path.exists(path):
                    model_path = path
                    break
            if model_path is None:
                raise FileNotFoundError("Disease model not found")
        
        print(f"Loading model from: {model_path}")
        
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        # Load checkpoint
        ckpt = torch.load(model_path, map_location=self.device, weights_only=False)
        self.class_names = ckpt["class_names"]
        num_classes = ckpt["num_classes"]

        # Create EfficientNet-B3 model
        self.model = models.efficientnet_b3(weights=None)
        in_feat = self.model.classifier[1].in_features
        self.model.classifier = nn.Sequential(
            nn.Dropout(0.4),
            nn.Linear(in_feat, num_classes)
        )

        # Strip "base." prefix if present
        state_dict = ckpt["model_state"]
        new_state_dict = {}
        for key, value in state_dict.items():
            new_key = key[5:] if key.startswith("base.") else key
            new_state_dict[new_key] = value
        
        self.model.load_state_dict(new_state_dict)
        print(f"Disease model loaded successfully with {num_classes} classes")
        
        self.model.to(self.device)
        self.model.eval()

        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])

    def predict(self, image: Image.Image):
        x = self.transform(image).unsqueeze(0).to(self.device)
        with torch.no_grad():
            probs = torch.softmax(self.model(x), dim=1)
        idx = probs.argmax().item()
        confidence = float(probs[0, idx]) * 100
        return self.class_names[idx], round(confidence, 2)