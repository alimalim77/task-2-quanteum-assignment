package com.example.housing_app;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

/**
 * Proxy service that forwards prediction requests to the
 * FastAPI ML model (Task 1 container) running on port 8001.
 */
@Service
public class MlModelService {

    private final WebClient webClient;

    public MlModelService(WebClient.Builder builder) {
        this.webClient = builder
                .baseUrl("http://localhost:8001")
                .build();
    }

    /**
     * Calls POST /predict on the FastAPI container and returns the prediction.
     * The result is cached by a hash of the input features so repeated
     * identical requests don't re-invoke the model.
     */
    @Cacheable(value = "mlPredictions", key = "#request.square_footage() + '-' + #request.bedrooms() + '-' + #request.bathrooms() + '-' + #request.year_built()")
    public Map<String, Object> predict(PredictionRequest request) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> result = webClient.post()
                    .uri("/predict")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
            return result != null ? result : fallback(request);
        } catch (Exception e) {
            System.err.println("[MlModelService] FastAPI unavailable, using fallback: " + e.getMessage());
            return fallback(request);
        }
    }

    /**
     * Simple linear fallback formula when the ML container is not running.
     */
    private Map<String, Object> fallback(PredictionRequest r) {
        double base = 150000;
        double prediction = base
                + r.square_footage() * 210
                + r.bedrooms() * 45000
                + r.bathrooms() * 32000
                - (2025 - r.year_built()) * 500
                + r.school_rating() * 15000
                - r.distance_to_city_center() * 5000;
        prediction = Math.max(80000, prediction);
        return Map.of(
                "prediction", Math.round(prediction),
                "source", "fallback",
                "note", "FastAPI ML model is not reachable. Using heuristic formula.");
    }
}
