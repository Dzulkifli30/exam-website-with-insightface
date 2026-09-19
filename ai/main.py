from fastapi import FastAPI, File, UploadFile, Body
from insightface.app import FaceAnalysis
import numpy as np
import cv2
import time
from typing import List


app = FastAPI(
    title="CBT Face Recognition API",
    description="API untuk ekstraksi embedding dan perbandingan wajah menggunakan InsightFace",
    version="1.0.0"
)


# ============================================================
# INSIGHTFACE CONFIGURATION
# ============================================================

face_app = FaceAnalysis(
    name="buffalo_l",
    providers=["CPUExecutionProvider"]
)

# ctx_id=-1 -> CPU
face_app.prepare(
    ctx_id=-1,
    det_size=(640, 640)
)


# ============================================================
# EXTRACT FACE EMBEDDING
# ============================================================

def extract_embedding(image_bytes):
    """
    Mengambil embedding wajah dari image bytes.
    """

    nparr = np.frombuffer(
        image_bytes,
        np.uint8
    )

    img = cv2.imdecode(
        nparr,
        cv2.IMREAD_COLOR
    )

    if img is None:
        return None

    faces = face_app.get(img)

    if len(faces) == 0:
        return None

    # Menggunakan wajah pertama
    emb = faces[0].normed_embedding

    if np.isnan(emb).any():
        return None

    return emb.tolist()


# ============================================================
# COSINE SIMILARITY
# ============================================================

def cosine_similarity(a, b):
    """
    Menghitung cosine similarity antara dua embedding.
    """

    a = np.array(a, dtype=np.float32)
    b = np.array(b, dtype=np.float32)

    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)

    if norm_a == 0 or norm_b == 0:
        return 0.0

    return float(
        np.dot(a, b) / (norm_a * norm_b)
    )


# ============================================================
# ROOT / HEALTH CHECK
# ============================================================

@app.get("/")
async def root():
    return {
        "status": "success",
        "message": "CBT Face Recognition API is running"
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "insightface"
    }


# ============================================================
# ENDPOINT 1
# Compare 2 Images
# ============================================================

@app.post("/compare")
async def compare(
    image1: UploadFile = File(...),
    image2: UploadFile = File(...)
):

    total_start = time.perf_counter()

    img1_bytes = await image1.read()
    img2_bytes = await image2.read()

    # -----------------------------------------
    # Extract embedding
    # -----------------------------------------

    emb1_data = extract_embedding(img1_bytes)
    emb2_data = extract_embedding(img2_bytes)

    if emb1_data is None or emb2_data is None:
        return {
            "error": "Wajah tidak terdeteksi pada salah satu gambar"
        }

    # -----------------------------------------
    # Cosine similarity
    # -----------------------------------------

    compare_start = time.perf_counter()

    similarity = cosine_similarity(
        emb1_data,
        emb2_data
    )

    compare_time = (
        time.perf_counter() -
        compare_start
    )

    total_time = (
        time.perf_counter() -
        total_start
    )

    # -----------------------------------------
    # Response
    # -----------------------------------------

    return {
        "similarity": similarity,
        "percentage": round(similarity * 100, 2),
        "time_compare": round(compare_time, 4),
        "time_total": round(total_time, 4)
    }


# ============================================================
# ENDPOINT 2
# Extract Embedding dari 1 foto
# ============================================================

@app.post("/embedding")
async def get_embedding_api(
    image: UploadFile = File(...)
):

    image_bytes = await image.read()

    embedding = extract_embedding(
        image_bytes
    )

    if embedding is None:
        return {
            "error": "Wajah tidak terdeteksi"
        }

    return {
        "embedding": embedding,
        "length": len(embedding)
    }


# ============================================================
# ENDPOINT 3
# Compare 2 Embedding
# ============================================================

@app.post("/compare-embedding")
async def compare_embedding(
    embedding1: List[float] = Body(...),
    embedding2: List[float] = Body(...)
):

    similarity = cosine_similarity(
        embedding1,
        embedding2
    )

    return {
        "similarity": similarity,
        "percentage": round(similarity * 100, 2)
    }


# ============================================================
# RUN SERVER
# ============================================================

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8001
    )