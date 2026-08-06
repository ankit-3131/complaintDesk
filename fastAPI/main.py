from contextlib import asynccontextmanager
from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer, util
import numpy as np
import re
import spacy
from spacy.lang.en.stop_words import STOP_WORDS
from fastapi.middleware.cors import CORSMiddleware

nlp = None
embed_model = None
EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"

@asynccontextmanager
async def lifespan(app: FastAPI):
    global nlp, embed_model

    try:
        import en_core_web_sm
        nlp = en_core_web_sm.load()
    except Exception:
        import spacy.cli
        spacy.cli.download("en_core_web_sm")
        nlp = spacy.load("en_core_web_sm")

    embed_model = SentenceTransformer(EMBEDDING_MODEL_NAME)

    yield

    nlp = None
    embed_model = None

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ComplaintRequest(BaseModel):
    title: str
    categories: list[str] = []

class ComplaintResponse(BaseModel):
    predicted_category: str

def clean_and_generate_category_name(title: str) -> str:
    words = re.findall(r"[a-zA-Z]+", title.lower())
    key_words = "".join(words[:3]) if len(words) >= 3 else "".join(words)
    return key_words or "general_issue"

custom_fillers = {
    "uh", "um", "er", "ah", "oh", "hmm", "huh", "hmmm",
    "like", "you know", "i mean", "sorta", "kinda", "sort of", "kind of",
    "basically", "actually", "literally", "seriously", "really", "honestly",
    "please", "kindly", "help", "assist", "request", "plz", "pls", "can", "could",
    "would", "will", "may", "sir", "madam", "team", "dear", "respected",
    "well", "so", "anyway", "ok", "okay", "alright", "hey", "hi", "hello",
    "look", "listen", "by the way", "to be honest", "believe me",
    "yeah", "yep", "nope", "uhhuh", "mmhmm", "right", "sure",
    "sorry", "apology", "apologies", "excuse", "excuse me",
    "just", "only", "simply", "sort", "kind", "somehow", "anyhow", "actually speaking"
}
STOP_WORDS |= custom_fillers

def spacy_clean(text: str) -> str:
    doc = nlp(text)
    tokens = [
        token.lemma_.lower()
        for token in doc
        if token.pos_ in {"NOUN", "PROPN"}
        and not token.is_stop
        and not token.is_punct
    ]
    return " ".join(tokens)

@app.post("/get_category/", response_model=ComplaintResponse)
def get_category(data: ComplaintRequest):
    title_raw = data.title.strip()
    title_alpha = " ".join(re.findall(r"[a-zA-Z]+", title_raw.lower()))
    cleaned_title = spacy_clean(title_alpha)
    print("cleaned_title:", cleaned_title)

    categories = data.categories or []

    if not categories:
        new_cat = clean_and_generate_category_name(cleaned_title)
        return ComplaintResponse(predicted_category=new_cat)

    try:
        title_emb = embed_model.encode(cleaned_title, convert_to_tensor=True)
        cat_embs = embed_model.encode(categories, convert_to_tensor=True)
    except Exception as e:
        print("Embedding error:", e)
        new_cat = clean_and_generate_category_name(cleaned_title)
        return ComplaintResponse(predicted_category=new_cat)

    sims_mat = util.cos_sim(title_emb, cat_embs)

    sims = sims_mat.squeeze(0).cpu().numpy()
    best_idx = int(np.argmax(sims))
    best_score = float(sims[best_idx])
    best_category = categories[best_idx]

    THRESHOLD = 0.50

    if best_score >= THRESHOLD:
        return ComplaintResponse(predicted_category=best_category)
    else:
        new_cat = clean_and_generate_category_name(cleaned_title)
        return ComplaintResponse(predicted_category=new_cat)

@app.get("/")
def home():
    return {"message": "Working"}