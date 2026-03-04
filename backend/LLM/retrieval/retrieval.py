from qdrant_client import QdrantClient
from qdrant_client.http import models
from .get_model import get_model
import os

COLLECTION_NAME = os.getenv("QDRANT_COLLECTION_NAME") or "kcc_knowledge_base"
URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")


# Model will be loaded during FastAPI lifespan startup, or dynamically if not preloaded.
client = QdrantClient(
    url=URL,
    api_key=QDRANT_API_KEY,
)

def retrieve_answer(query, crop_filter=None, top_k=3):
    """
        Args:
            query (str): Query used to retrieve relevant information from the knowledge base.
            crop_filter (str, optional): Crop name to filter the knowledge base. Defaults to None
            top_k (int, optional): Number of top results to retrieve. Defaults to 3.

        Returns:
            List of relevant answers from the knowledge base.        
    """
    query_text = f"Crop: {crop_filter} | Query: {query}" if crop_filter else query
    
    model = get_model()
    query_vector = model.encode(query_text).tolist()

    query_filter = None
    if crop_filter:
        query_filter = models.Filter(
            must=[
                models.FieldCondition(
                    key="Crop_Normalized",
                    match=models.MatchValue(value=crop_filter),
                )
            ]
        )

    hits = client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_vector,
        query_filter=query_filter,
        limit=top_k
    )
    result = []
    for hit in hits:
        if hit[1] == []:
            return result
        score = hit[1][0].score
        hit = hit[1][0]
        crop = hit.payload.get('Crop_Normalized')
        orig_q = hit.payload.get('QueryText')
        ans = hit.payload.get('KccAns')
        result.append({"context": ans, "score": score, "historical_query": orig_q})
        # print(f"\n[Score: {score:.4f}] Crop: {crop}")
        # print(f"❓ Hist. Query: {orig_q}")
        # print(f"💡 Answer: {ans}...")
    return result
