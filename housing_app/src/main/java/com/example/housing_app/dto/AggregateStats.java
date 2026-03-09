package com.example.housing_app.dto;



import java.util.Map;

/**
 * Aggregate statistics response for the /api/stats endpoint.
 */
public record AggregateStats(
        int totalProperties,
        double avgPrice,
        int minPrice,
        int maxPrice,
        double medianPrice,
        double avgSquareFootage,
        double avgSchoolRating,
        Map<Integer, Double> avgPriceByBedrooms // bedrooms -> avg price
) {
}
