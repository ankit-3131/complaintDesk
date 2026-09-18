from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
import re
from google import genai
import numpy as np
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Complaint Categorization Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize google-genai client
client = genai.Client()
EMBEDDING_MODEL_NAME = "gemini-embedding-2"

CATEGORIES_DEFINITIONS = {
    "Broken Physical Infrastructure": [
        "Broken Physical Infrastructure. Tangible, stationary objects built by the city that have sustained physical damage and require manual repair. Concrete, asphalt, metal, and structural damage.",
        "Broken, pothole, collapsed, damaged, cracked, missing cover, streetlights, bridge, pavement, park bench, road crater, broken sidewalk, guardrail, damaged divider, broken traffic light.",
        "Deep pothole on Main Street. Pothole in the road causing vehicle damage.",
        "Broken streetlight pole leaning over. Damaged street light not working at night.",
        "Missing manhole cover on street. Broken pavement or sidewalk cracked.",
        "Damaged road divider and broken guardrail on highway. Collapsed pedestrian bridge."
    ],
    "Sanitation & Biological Hazards": [
        "Sanitation & Biological Hazards. Waste, dirt, animals, and anything requiring cleaning, removal, or pest control to maintain public hygiene. Cleanliness, garbage, and nature.",
        "Garbage, trash, smell, dead animal, overflowing, dirty, sweep, sewer backup, mosquitoes, stray dogs, rotten waste, stagnant water, filthy drain, open defecation, clogged gutter.",
        "Trash not collected for 3 days. Overflowing garbage bins on the road.",
        "Dead raccoon or dog on the sidewalk. Dead animal rotting in the open.",
        "Foul smell from open drain. Sewer backup overflowing onto street.",
        "Public toilet filthy and clogged. Mosquito breeding in stagnant gutter water."
    ],
    "Utility Outages (Power & Water)": [
        "Utility Outages (Power & Water). The disruption of essential resources flowing into a citizen's home or neighborhood. Flow and supply of power, electricity, drinking water, and gas.",
        "Outage, cut, no power, voltage, low pressure, no water, disconnected, supply, meter, bill, electricity failure, blackout, transformer spark, burst water pipeline, dirty tap water.",
        "Electricity gone since morning. Power outage in our residential neighborhood.",
        "Very low water pressure in taps. No water supply for multiple hours.",
        "Wrong meter reading on water bill. Excessive electricity charges.",
        "Electric transformer sparked and power failed. Burst water pipe flooding street."
    ],
    "Public Nuisance & Rule Violations": [
        "Public Nuisance & Rule Violations. Bad behavior by other humans or businesses that violates civic laws, disrupts peace, or creates unauthorized changes. Human illegal, disruptive, or annoying actions.",
        "Public fighting, brawl, violence, physical altercation, clash between groups, rowdy behavior, hooliganism, harassment, creating ruckus, disturbing public peace.",
        "Noise, loud music, illegal parking, unauthorized, encroachment, blocked path, fighting, trespassing, illegal construction, street obstruction, nuisance, illegal vendors.",
        "Shop extending onto the walking path. Commercial encroachment on public pavement.",
        "Neighbors playing loud music at 2 AM. Severe noise disturbance.",
        "Abandoned car blocking driveway. Illegal vehicle parking obstructing traffic.",
        "Group of people fighting on the street. Public brawl and altercation outside mall.",
        "Rowdy crowd causing public nuisance and harassment. People shouting and fighting in public area."
    ],
    "Document & Administrative Failures": [
        "Document & Administrative Failures. Bureaucracy, paperwork, digital portals, taxes, and interactions with city staff. Paper, data, and money.",
        "Certificate, delayed, tax, portal, website down, rejected, application, license, bribe, unhelpful staff, refund, payment gateway failed, revenue officer corrupt, registration pending.",
        "Birth certificate application stuck for a month. Death certificate pending approval.",
        "Property tax payment gateway failed. Municipal website portal down.",
        "Municipal clerk asking for bribe. Unhelpful administrative staff refusing service.",
        "Trade license or caste certificate application rejected without explanation."
    ]
}

# Pre-compute and cache category anchor tensors at startup
CATEGORY_NAMES = list(CATEGORIES_DEFINITIONS.keys())
CATEGORY_ANCHORS = {}

def get_embedding(text_list):
    response = client.models.embed_content(model=EMBEDDING_MODEL_NAME, contents=text_list)
    # google-genai returns a list of EmbedContentResponse objects for multiple inputs
    return np.array([e.values for e in response.embeddings])

print("Pre-computing category embeddings...")
for cat_name, anchor_texts in CATEGORIES_DEFINITIONS.items():
    # Store as a 2D numpy array: (num_anchors, embedding_dim)
    CATEGORY_ANCHORS[cat_name] = get_embedding(anchor_texts)
print("Finished pre-computing category embeddings.")

# Similarity threshold to confirm alignment with a category
ALIGNMENT_THRESHOLD = 0.50  # Adjusted threshold since Gemini embeddings typically have higher baseline cosine similarity


class ComplaintRequest(BaseModel):
    title: str
    description: Optional[str] = ""
    categories: Optional[List[str]] = []


class ComplaintResponse(BaseModel):
    predicted_category: str
    confidence_score: Optional[float] = None


@app.post("/get_category/", response_model=ComplaintResponse)
def get_category(data: ComplaintRequest):
    raw_title = (data.title or "").strip()
    raw_description = (data.description or "").strip()

    if not raw_title and not raw_description:
        return ComplaintResponse(predicted_category="other", confidence_score=0.0)

    # Combine title and description to capture rich semantic context
    if raw_title and raw_description:
        query_text = f"{raw_title}. {raw_description}"
    else:
        query_text = raw_title or raw_description

    # Encode complaint into embedding tensor
    query_response = client.models.embed_content(model=EMBEDDING_MODEL_NAME, contents=query_text)
    query_embedding = np.array(query_response.embeddings[0].values)

    best_category = "other"
    best_score = -1.0

    # Multi-anchor cosine similarity search across all 5 pre-defined categories
    for cat_name in CATEGORY_NAMES:
        anchor_embeddings = CATEGORY_ANCHORS[cat_name]
        
        # Calculate cosine similarities against all anchors in the category
        # Since embeddings are normalized by default in Gemini, we can just use dot product,
        # but to be safe we'll do full cosine similarity:
        norm_query = np.linalg.norm(query_embedding)
        norm_anchors = np.linalg.norm(anchor_embeddings, axis=1)
        similarities = np.dot(anchor_embeddings, query_embedding) / (norm_anchors * norm_query)
        
        max_similarity = similarities.max().item()

        if max_similarity > best_score:
            best_score = max_similarity
            best_category = cat_name

    # Apply alignment threshold: if aligned, return category, otherwise 'other'
    final_category = best_category if best_score >= ALIGNMENT_THRESHOLD else "other"

    return ComplaintResponse(
        predicted_category=final_category,
        confidence_score=round(best_score, 4)
    )


@app.get("/")
def home():
    return {
        "status": "online",
        "engine": "google-genai",
        "categories": CATEGORY_NAMES,
        "threshold": ALIGNMENT_THRESHOLD
    }