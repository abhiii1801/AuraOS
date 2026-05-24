def get_embedding(text: str, genai_client):
    """Translates plain text into a 3072-dimensional vector array using Gemini."""
    try:
        response = genai_client.models.embed_content(
            model='gemini-embedding-001',
            contents=text
        )
        return response.embeddings[0].values
    except Exception as e:
        print(f"Embedding failed: {e}")
        return None

def search_second_brain(query_text: str, user_id: str, supabase, genai_client, limit: int = 3):
    """Embeds the query and searches the Supabase vector vault."""
    try:
        query_vector = get_embedding(query_text, genai_client)
        if not query_vector:
            return "Failed to embed query."

        response = supabase.rpc(
            'match_notes', 
            {
                'query_embedding': query_vector, 
                'match_threshold': 0.3, 
                'match_count': limit,
                'search_user_id': user_id
            }
        ).execute()

        results = response.data
        if not results:
            return "No relevant notes found in your vault."

        retrieved_context = ""
        for i, row in enumerate(results):
            retrieved_context += f"Note {i+1} [{row['category']}]: {row['content']}\n"
            
        return retrieved_context

    except Exception as e:
        return f"Database Search Error: {e}"

def process_second_brain_action(params, supabase, user_id, genai_client):
    """Processes ingesting a new note to the vault."""
    headline = params.get("headline", "Note")
    raw_prompt = params.get("raw_prompt", params.get("content", "Empty note"))
    category = params.get("category", "Misc")
    tags = params.get("tags", [])

    reply_text = f"🧠 Saving to Vault [{category}]...\n"
    
    vector_array = get_embedding(raw_prompt, genai_client)
    
    if not vector_array:
         reply_text += "⚠️ Failed to generate AI embedding. Note not saved.\n"
    else:
        supabase.table("second_brain").insert({
            "user_id": user_id,
            "content": headline,
            "raw_prompt": raw_prompt,
            "category": category,
            "tags": tags,
            "embedding": vector_array
        }).execute()
        
        tag_string = ", ".join([f"#{tag}" for tag in tags]) if tags else "#untagged"
        
        reply_text += f"📝 **{headline}**\n"
        reply_text += f"🏷️ {tag_string}\n"
        reply_text += f"📐 Vector mapped in {len(vector_array)} dimensions.\n"
        
    return reply_text

def process_second_brain_query_action(params, supabase, user_id, genai_client):
    """Processes RAG retrieval and synthesis."""
    search_query = params.get("search_query", "")
    user_prompt = params.get("user_prompt", "")
    
    reply_text = f"🧠 Searching Vault for concepts related to: '{search_query}'...\n\n"
    
    vault_context = search_second_brain(search_query, user_id, supabase, genai_client)
    
    if "Error" in vault_context or "No relevant notes" in vault_context:
        reply_text += vault_context + "\n"
    else:
        synthesis_prompt = f"""
        You are AuraOS, a helpful executive assistant. The user asked: "{user_prompt}"
        
        Please answer the user's question using ONLY the following notes retrieved from their personal Second Brain vault:
        {vault_context}
        
        If the answer isn't clearly in the notes, say you don't have enough context. Be conversational and helpful.
        """
        
        synthesis_response = genai_client.models.generate_content(
            model='gemini-2.5-flash',
            contents=synthesis_prompt
        )
        
        reply_text += f"✨ **AuraOS:**\n{synthesis_response.text}\n"
        
    return reply_text
