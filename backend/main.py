from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import time
import torch
import torch.nn.functional as F
from backend.model import load_model
from backend.utils import preprocess_video
from backend.schemas import PredictionResult

app = FastAPI(title="Video Violence Detection API")

# CORS Setup (Allow Frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, verify specific origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
MODEL_PATH = r"c:\Users\yassi\Documents\projects\Video Violence Detection\models\best_cnn_lstm.pth"
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

print(f"Loading model from {MODEL_PATH} to {DEVICE}...")
if not os.path.exists(MODEL_PATH):
    print(f"WARNING: Model file not found at {MODEL_PATH}")
    # In a real app we might want to crash or handle this gracefully
    model = None
else:
    try:
        model = load_model(MODEL_PATH, DEVICE)
        print("Model loaded successfully.")
    except Exception as e:
        print(f"Error loading model: {e}")
        model = None

@app.get("/")
async def root():
    return {"message": "Video Violence Detection API is running"}

@app.post("/predict", response_model=PredictionResult)
async def predict_video(file: UploadFile = File(...)):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded server-side.")
        
    start_time = time.time()
    
    # Save uploaded file temporarily
    temp_filename = f"temp_{int(start_time)}_{file.filename}"
    with open(temp_filename, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        # Preprocess
        input_tensor = preprocess_video(temp_filename)
        input_tensor = input_tensor.to(DEVICE)
        
        # Inference
        with torch.no_grad():
            output = model(input_tensor) # Logits
            prob = torch.sigmoid(output).item()
            
        prediction = prob > 0.5
        
        process_time = (time.time() - start_time) * 1000
        
        return PredictionResult(
            filename=file.filename,
            is_violent=prediction,
            confidence=prob,
            message="Violence Detected" if prediction else "No Violence Detected",
            processing_time_ms=process_time
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    finally:
        # Cleanup
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
