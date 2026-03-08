import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import json

def train_model():
    print("Loading datasets...")
    # Load dataset
    df = pd.read_csv("House Price Dataset.csv")
    
    # Define features and target
    features = ['square_footage', 'bedrooms', 'bathrooms', 'year_built', 'lot_size', 'distance_to_city_center', 'school_rating']
    target = 'price'
    
    X = df[features]
    y = df[target]
    
    print("Training Linear Regression model...")
    # Train model
    model = LinearRegression()
    model.fit(X, y)
    
    # Calculate performance metrics using training data for simplicity
    predictions = model.predict(X)
    mae = mean_absolute_error(y, predictions)
    r2 = r2_score(y, predictions)
    
    # Extract coefficients
    coefficients = dict(zip(features, model.coef_))
    intercept = model.intercept_
    
    # Create an artifact dictionary
    model_artifact = {
        "model": model,
        "features": features,
        "metrics": {
            "mean_absolute_error": mae,
            "r2_score": r2
        },
        "coefficients": coefficients,
        "intercept": intercept
    }
    
    print(f"Model trained successfully. MAE: {mae:.2f}, R2: {r2:.2f}")
    
    # Save the artifact
    joblib.dump(model_artifact, "model.joblib")
    print("Model saved to model.joblib")

if __name__ == "__main__":
    train_model()
