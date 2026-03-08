from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Union
import joblib
import os
import pandas as pd

app = FastAPI(
    title="Housing Price Prediction API",
    description="A simple regression model API that predicts housing prices based on features.",
    version="1.0.0"
)

# Add CORS middleware to allow requests from the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the model globally
MODEL_PATH = "model.joblib"
model_artifact = None

@app.on_event("startup")
def load_model():
    global model_artifact
    if os.path.exists(MODEL_PATH):
        model_artifact = joblib.load(MODEL_PATH)
    else:
        print(f"Warning: Model file {MODEL_PATH} not found. Please train the model first.")

# Schemas
class HouseFeatures(BaseModel):
    square_footage: float
    bedrooms: int
    bathrooms: float
    year_built: int
    lot_size: float
    distance_to_city_center: float
    school_rating: float

class PredictionResponse(BaseModel):
    prediction: float

class BatchPredictionResponse(BaseModel):
    predictions: List[float]

class ModelInfoResponse(BaseModel):
    coefficients: dict
    intercept: float
    metrics: dict
    features: List[str]

@app.get("/health")
def health_check():
    """Simple health check endpoint."""
    return {"status": "ok"}

@app.get("/model-info", response_model=ModelInfoResponse)
def model_info():
    """Returns model coefficients and performance metrics."""
    if model_artifact is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    return ModelInfoResponse(
        coefficients=model_artifact["coefficients"],
        intercept=model_artifact["intercept"],
        metrics=model_artifact["metrics"],
        features=model_artifact["features"]
    )

@app.post("/predict", response_model=Union[PredictionResponse, BatchPredictionResponse])
def predict(data: Union[HouseFeatures, List[HouseFeatures]]):
    """
    Accepts housing features and returns price predictions.
    Supports both single and batch predictions.
    """
    if model_artifact is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    model = model_artifact["model"]
    features = model_artifact["features"]
    
    if isinstance(data, list):
        # Batch prediction
        df = pd.DataFrame([item.dict() for item in data])[features]
        predictions = model.predict(df).tolist()
        return BatchPredictionResponse(predictions=predictions)
    else:
        # Single prediction
        df = pd.DataFrame([data.dict()])[features]
        prediction = model.predict(df)[0]
        return PredictionResponse(prediction=prediction)
