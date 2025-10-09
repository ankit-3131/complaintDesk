from fastapi import FastAPI
from pydantic import BaseModel
from pymongo import MongoClient
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import re

app = FastAPI()

client = MongoClient("mongodb://localhost:27017")  # MongoDB Atlas URL
db = client["complaint_db"]
categories_collection = db["categories"]

class ComplaintRequest(BaseModel):
    title: str

class ComplaintResponse(BaseModel):
    predicted_category: str
    

def build_vectorizer_and_matrix():
    data = list(categories_collection.find({}))
    titles = []
    category_labels = []
    for cat in data:
        for t in cat.get("titles", []):
            titles.append(t)
            category_labels.append(cat["category"])

    if not titles:
        return None, None, None

    vectorizer = TfidfVectorizer()
    matrix = vectorizer.fit_transform(titles)
    return vectorizer, matrix, category_labels




def clean_and_generate_category_name(title: str) -> str:
    words = re.findall(r"[a-zA-Z]+", title.lower())
    key_words = "_".join(words[:3]) if len(words) >= 3 else "_".join(words)
    return key_words or "general_issue"


@app.post("/get_category/", response_model=ComplaintResponse)
def get_category(data: ComplaintRequest):
    title = data.title.strip()

    vectorizer, matrix, labels = build_vectorizer_and_matrix()

    if matrix is None:
        cat = clean_and_generate_category_name(title)
        return ComplaintResponse(
            predicted_category=cat
        )

    new_vec = vectorizer.transform([title])

    sims = cosine_similarity(new_vec, matrix).flatten()
    best_idx = np.argmax(sims)
    best_score = sims[best_idx]
    best_category = labels[best_idx]

    THRESHOLD = 0.4  

    if best_score >= THRESHOLD:
        return ComplaintResponse(
            predicted_category=best_category
        )
    else:
        new_cat = clean_and_generate_category_name(title)
        return ComplaintResponse(
            predicted_category=new_cat
        )


@app.get("/")
def home():
    return {"message": "Working"}
