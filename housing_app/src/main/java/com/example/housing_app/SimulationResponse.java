package com.example.housing_app;

public record SimulationResponse(
    String year,
    int baseline,
    int projected
) {}
