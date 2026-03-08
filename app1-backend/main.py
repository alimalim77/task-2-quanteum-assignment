from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import os
import pandas as pd
from datetime import datetime

app = FastAPI(
    title="App 1: Property Value Estimator API",
    description="A dedicated backend for predicting housing prices using a regression model.",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the model
MODEL_PATH = "model.joblib"
model_data = None

@app.on_event("startup")
def load_model():
    global model_data
    if os.path.exists(MODEL_PATH):
        try:
            model_data = joblib.load(MODEL_PATH)
            print("Model loaded successfully.")
        except Exception as e:
            print(f"Error loading model: {e}")
    else:
        print(f"Warning: Model file {MODEL_PATH} not found.")

# Pydantic Schemas for Validation
class PropertyInput(BaseModel):
    square_footage: float = Field(..., gt=0, description="Total square footage of the property.")
    bedrooms: int = Field(..., ge=0, description="Number of bedrooms.")
    bathrooms: float = Field(..., ge=0, description="Number of bathrooms.")
    year_built: int = Field(..., ge=1800, le=datetime.now().year, description="Year the property was built.")
    lot_size: float = Field(..., ge=0, description="Lot size in square feet.")
    distance_to_city_center: float = Field(..., ge=0, description="Distance to city center in miles.")
    school_rating: float = Field(..., ge=0, le=10, description="Rating of nearby schools (0-10).")

class PredictionResponse(BaseModel):
    prediction: float
    timestamp: str

@app.get("/health")
def health_check():
    return {"status": "ok", "model_loaded": model_data is not None}

@app.post("/predict", response_model=PredictionResponse)
def predict(data: PropertyInput):
    if model_data is None:
        raise HTTPException(status_code=503, detail="Model not loaded on server.")
    
    try:
        # Extract features and model
        model = model_data["model"]
        feature_names = model_data["features"]
        
        # Prepare data for prediction
        input_df = pd.DataFrame([data.dict()])[feature_names]
        
        # Make prediction
        prediction = model.predict(input_df)[0]
        
        return PredictionResponse(
            prediction=float(prediction),
            timestamp=datetime.now().isoformat()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
