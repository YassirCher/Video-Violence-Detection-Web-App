from pydantic import BaseModel
from typing import List

class PredictionResult(BaseModel):
    filename: str
    is_violent: bool
    confidence: float
    message: str
    processing_time_ms: float
