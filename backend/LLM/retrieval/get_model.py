from sentence_transformers import SentenceTransformer
import vertexai
from vertexai import model_garden
import os

_model = None

def get_model(MODEL_NAME="paraphrase-multilingual-MiniLM-L12-v2"):
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        import vertexai
        from vertexai import model_garden
        import os
        
        base_dir = os.path.dirname(__file__)
        model_dir = os.path.join(base_dir, "models")
        model_path = os.path.join(model_dir, "minilm")
        
        if os.path.exists(model_path):
            _model = SentenceTransformer(model_path)
        else:
            os.makedirs(model_dir, exist_ok=True)
            try:
                _model = SentenceTransformer(MODEL_NAME)
                _model.save(model_path)
            except Exception as e:
                print(f"Warning: Could not save model: {e}")
    return _model

# if __name__ == "__main__":
#     get_model("paraphrase-multilingual-MiniLM-L12-v2")

