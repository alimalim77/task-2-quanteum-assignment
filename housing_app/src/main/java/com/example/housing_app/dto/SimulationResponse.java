package com.example.housing_app.dto;



public record SimulationResponse(
    String year,
    int baseline,
    int projected
) {}
