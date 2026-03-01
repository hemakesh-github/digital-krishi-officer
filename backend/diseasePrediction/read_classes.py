import torch
ckpt = torch.load("best_model.pth", map_location="cpu", weights_only=False)
print(ckpt["class_names"])
