import os
from supabase import create_client
from openai import OpenAI
from google import genai
from dotenv import load_dotenv
from loguru import logger

load_dotenv(override=True)

# --- Config ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
openai_client = OpenAI(api_key=OPENAI_API_KEY)

# Gemini setup
gemini_client = genai.Client()

# --- Fetch rows without embeddings ---
rows = supabase.table("books_summary").select("*").execute().data
logger.info(f"Found {len(rows)} rows without embeddings")

for row in rows:
    summary_text = row["summary"]

    # --- OpenAI embedding ---
    if row.get("embedding_openai") is None:
        oai_response = openai_client.embeddings.create(
            model="text-embedding-3-small",  # or large
            input=summary_text
        )
        openai_vector = oai_response.data[0].embedding
    else:
        openai_vector = row["embedding_openai"]

    # --- Gemini embedding ---
    if row.get("embedding_gemini") is None:
        gemini_result = gemini_client.models.embed_content(
                model="gemini-embedding-001",
                contents=summary_text)

        gemini_vector = list(gemini_result.embeddings[0].values)
    else:
        gemini_vector = row["embedding_gemini"]

    # --- Update Supabase row ---
    logger.info(f"Updating embeddings for book_id={row['book_id']} chapter={row['chapter']}")
    logger.info(f"row['id']={row['id']}")
    supabase.table("books_summary").update({
        "embedding_openai": openai_vector,
        "embedding_gemini": gemini_vector
    }).eq("id", row["id"]).execute()

    logger.info(f"✅ Updated embeddings for book_id={row['book_id']} chapter={row['chapter']}")
