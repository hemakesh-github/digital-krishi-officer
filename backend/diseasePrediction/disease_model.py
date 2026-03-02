import os
import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
from google.cloud import storage


class DiseasePrediction:

    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        bucket_name = os.getenv("GCS_BUCKET_NAME")
        blob_path =  os.getenv("GCS_BUCKET_FOLDER_MODEL")+"/disease/best_model.pth"
        local_path = "/tmp/best_model.pth"

        # Download from GCS if not already in /tmp
        if not os.path.exists(local_path):
            client = storage.Client()
            bucket = client.bucket(bucket_name)
            blob = bucket.blob(blob_path)
            blob.download_to_filename(local_path)

        print(f"Loading model from: {local_path}")

        ckpt = torch.load(local_path, map_location=self.device)

        self.class_names = ckpt["class_names"]
        num_classes = ckpt["num_classes"]

        self.model = models.efficientnet_b3(weights=None)
        in_feat = self.model.classifier[1].in_features
        self.model.classifier = nn.Sequential(
            nn.Dropout(0.4),
            nn.Linear(in_feat, num_classes)
        )

        state_dict = ckpt["model_state"]
        new_state_dict = {
            (k[5:] if k.startswith("base.") else k): v
            for k, v in state_dict.items()
        }

        self.model.load_state_dict(new_state_dict)
        self.model.to(self.device)
        self.model.eval()

        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406],
                                 [0.229, 0.224, 0.225])
        ])

    def predict(self, image: Image.Image):
        x = self.transform(image).unsqueeze(0).to(self.device)
        with torch.no_grad():
            probs = torch.softmax(self.model(x), dim=1)

        idx = probs.argmax().item()
        confidence = float(probs[0, idx]) * 100

        return self.class_names[idx], round(confidence, 2)