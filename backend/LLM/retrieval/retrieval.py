from qdrant_client import QdrantClient
from qdrant_client.http import models
from .get_model import get_model

MODEL_NAME = 'all-MiniLM-L6-v2'
COLLECTION_NAME = 'kcc_knowledge_base'

# Get the model once at module level (will use cached instance after startup preloading)
# _model = get_model()

client = QdrantClient(
    url="https://2d2879b8-2fe8-466e-9162-61e89208a79a.europe-west3-0.gcp.cloud.qdrant.io:6333",
    api_key="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.5Pl59-Hqq9ZrnCVquZupZCszVUgK9NxJ23dc7LM732Y",
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
    print(f"\n🔍 Query: '{query}' (Crop: {crop_filter})")
    # Use the module-level cached model
    query_text = f"Crop: {crop_filter} | Query: {query}" if crop_filter else query
    query_vector = _model.encode(query_text).tolist()

    # Filter condition
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
        print(hit)
        if hit[1] == []:
            return result
        score = hit[1][0].score
        hit = hit[1][0]
        crop = hit.payload.get('Crop_Normalized')
        orig_q = hit.payload.get('QueryText')
        ans = hit.payload.get('KccAns')
        result.append({"context": ans, "score": score, "historical_query": orig_q})
        print(f"\n[Score: {score:.4f}] Crop: {crop}")
        print(f"❓ Hist. Query: {orig_q}")
        print(f"💡 Answer: {ans}...")
    return result