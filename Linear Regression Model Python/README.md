# Housing Price Prediction API

Professional Housing Price Prediction Model API built with FastAPI and Scikit-learn.

## Project Structure
- `app.py`: FastAPI implementation with endpoints for prediction, model info, and health.
- `train.py`: Script to train the Linear Regression model and save artifacts.
- `TRAINING_MECHANISM.md`: Detailed comprehensive guide explaining how the `train.py` machine learning mechanism works.
- `House Price Dataset.csv`: Training data.
- `model.joblib`: Trained model artifact (includes coefficients and metrics).
- `Dockerfile`: Container configuration.
- `requirements.txt`: Python dependencies.

## Setup and Local Execution

1. **Create and Activate Virtual Environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

2. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Train the Model:**
   ```bash
   python3 train.py
   ```

4. **Run the API:**
   ```bash
   uvicorn app:app --host 127.0.0.1 --port 8000
   ```

5. **API Documentation:**
   Once the API is running, access the interactive Swagger UI at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

## Docker Execution

### Option A: Use the Pre-built Image (Docker Hub)
You can directly pull the latest pre-built image from Docker Hub without building it yourself:

1. **Pull the Image:**
   ```bash
   docker pull alimalim77/housing-price-api:latest
   ```

2. **Run the Container:**
   ```bash
   docker run -p 8000:8000 alimalim77/housing-price-api:latest
   ```

3. **Access API:**
   The API will be available at [http://localhost:8000/docs](http://localhost:8000/docs)

### Option B: Build it locally
If you made changes to the code and want to build the local version:

1. **Build the Image:**
   ```bash
   docker build -t housing-price-api .
   ```

2. **Run the Container:**
   ```bash
   docker run -p 8000:8000 housing-price-api
   ```

3. **Access API:**
   The API will be available at [http://localhost:8000/docs](http://localhost:8000/docs)

## API Endpoints

- `GET /health`: Health check endpoint.
- `GET /model-info`: Returns model coefficients, intercept, and performance metrics (MAE, R2).
- `POST /predict`: Accepts single or batch features for price prediction.
  - **Single Input Example:**
    ```json
    {
      "square_footage": 1500,
      "bedrooms": 3,
      "bathrooms": 2,
      "year_built": 2000,
      "lot_size": 5000,
      "distance_to_city_center": 5,
      "school_rating": 8
    }
    ```
