import math
import logging
import json

logger = logging.getLogger("AuraOS.SecondBrainHelpers")

def _cosine_similarity(a: list, b: list) -> float:
    """Cosine similarity between two equal-length vectors."""
    if not a or not b:
        return 0.0
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(x * x for x in b))
    return dot / (norm_a * norm_b) if norm_a and norm_b else 0.0


def get_vault_nodes_and_links(supabase, user_id: str) -> tuple:
    """
    Returns (nodes, links) for the Second Brain graph.
    Links are pairs whose embedding cosine similarity >= 0.5.
    """
    try:
        res = (
            supabase.table("second_brain")
            .select("id, category, content, embedding")
            .eq("user_id", user_id)
            .execute()
        )
        rows = res.data or []

        processed_rows = []
        nodes = []

        for row in rows:
            raw_emb = row.get("embedding")
            
            # 1. SAFETY PARSER: Convert string representation of list to actual list
            if isinstance(raw_emb, str):
                try:
                    raw_emb = json.loads(raw_emb)
                except:
                    # Fallback if it's not valid JSON (manual SQL entry style)
                    raw_emb = [float(x) for x in raw_emb.strip("[]").split(",") if x.strip()]
            
            # 2. FILTER: Only process rows that have a valid embedding
            if raw_emb and isinstance(raw_emb, list):
                content = row.get("content", "")
                label = (content[:40] + "…") if len(content) > 40 else content
                
                nodes.append({
                    "id": str(row["id"]),
                    "category": row.get("category", "Misc"),
                    "content": content,
                    "label": label,
                })
                
                # Update the row with the parsed list for the similarity math below
                row["embedding"] = raw_emb
                processed_rows.append(row)

        # 3. LINK GENERATION: Use the processed_rows list
        THRESHOLD = 0.5
        links = []
        for i in range(len(processed_rows)):
            for j in range(i + 1, len(processed_rows)):
                score = _cosine_similarity(
                    processed_rows[i].get("embedding"),
                    processed_rows[j].get("embedding"),
                )
                if score >= THRESHOLD:
                    links.append({
                        "source": str(processed_rows[i]["id"]),
                        "target": str(processed_rows[j]["id"]),
                        "value": round(score, 4),
                    })

        return nodes, links
    except Exception as e:
        logger.error(f"get_vault_nodes_and_links: {e}")
        return [], []
