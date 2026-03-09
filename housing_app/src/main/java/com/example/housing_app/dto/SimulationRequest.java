package com.example.housing_app.dto;



public record SimulationRequest(
    double interestRate,
    double inflationRate,
    double migrationTrend
) {}
