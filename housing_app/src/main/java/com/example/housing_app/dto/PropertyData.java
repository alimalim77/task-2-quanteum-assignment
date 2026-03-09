package com.example.housing_app.dto;



public record PropertyData(
    int id,
    int sqft,
    int price,
    int beds,
    int year
) {}
