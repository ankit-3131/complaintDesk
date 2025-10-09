from fastapi import FastAPI
from pydantic import BaseModel
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import re

app = FastAPI()

class ComplaintRequest(BaseModel):
    title: str
    categories: list[str] = [] 

class ComplaintResponse(BaseModel):
    predicted_category: str


def clean_and_generate_category_name(title: str) -> str:
    words = re.findall(r"[a-zA-Z]+", title.lower())
    key_words = "_".join(words[:3]) if len(words) >= 3 else "_".join(words)
    return key_words or "general_issue"


@app.post("/get_category/", response_model=ComplaintResponse)
def get_category(data: ComplaintRequest):
    title = data.title.strip()
    categories = data.categories

    if not categories:
        new_cat = clean_and_generate_category_name(title)
        return ComplaintResponse(predicted_category=new_cat)

    vectorizer = TfidfVectorizer()
    matrix = vectorizer.fit_transform(categories) 
    new_vec = vectorizer.transform([title])

    sims = cosine_similarity(new_vec, matrix).flatten()
    best_idx = np.argmax(sims)
    best_score = sims[best_idx]
    best_category = categories[best_idx]

    THRESHOLD = 0.1

    if best_score >= THRESHOLD:
        return ComplaintResponse(predicted_category=best_category)
    else:
        new_cat = clean_and_generate_category_name(title)
        return ComplaintResponse(predicted_category=new_cat)


@app.get("/")
def home():
    return {"message": "Working"}
