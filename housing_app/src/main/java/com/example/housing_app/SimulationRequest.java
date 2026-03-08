package com.example.housing_app;

public record SimulationRequest(
    double interestRate,
    double inflationRate,
    double migrationTrend
) {}
