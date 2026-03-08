package com.example.housing_app;

/**
 * Request body for the ML model prediction proxy.
 */
public record PredictionRequest(
        double square_footage,
        int bedrooms,
        double bathrooms,
        int year_built,
        double lot_size,
        double distance_to_city_center,
        double school_rating) {
}
