from sentence_transformers import SentenceTransformer
import vertexai
from vertexai import model_garden
import os

_model = None

def get_model(MODEL_NAME="paraphrase-multilingual-MiniLM-L12-v2"):
    global _model
    if _model is None:
        _model = SentenceTransformer("C:\\Documents\\farmerAssist\\backend\\LLM\\retrieval\\models\\minilm")
        # Create directory if it doesn't exist
        # os.makedirs("models", exist_ok=True)
        # try:
        #     _model.save("models/minilm")
        # except Exception as e:
        #     print(f"Warning: Could not save model: {e}")
    return _model

# if __name__ == "__main__":
#     get_model("paraphrase-multilingual-MiniLM-L12-v2")

