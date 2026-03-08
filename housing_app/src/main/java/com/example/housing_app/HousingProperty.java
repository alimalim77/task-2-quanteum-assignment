package com.example.housing_app;

/**
 * Represents a single row from the housing_data.csv dataset.
 */
public record HousingProperty(
        int id,
        double squareFootage,
        int bedrooms,
        double bathrooms,
        int yearBuilt,
        double lotSize,
        double distanceToCityCenter,
        double schoolRating,
        int price) {
}
