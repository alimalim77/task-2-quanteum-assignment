package com.example.housing_app;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Loads the housing dataset CSV once at startup and provides
 * cached access to properties and aggregate statistics.
 */
@Service
public class HousingDataService {

    private List<HousingProperty> properties = new ArrayList<>();

    @PostConstruct
    public void loadCsv() {
        try {
            ClassPathResource resource = new ClassPathResource("housing_data.csv");
            try (BufferedReader br = new BufferedReader(new InputStreamReader(resource.getInputStream()))) {
                String line;
                boolean firstLine = true;
                while ((line = br.readLine()) != null) {
                    if (firstLine) {
                        firstLine = false;
                        continue;
                    } // skip header
                    String[] parts = line.split(",");
                    if (parts.length < 9)
                        continue;
                    properties.add(new HousingProperty(
                            Integer.parseInt(parts[0].trim()),
                            Double.parseDouble(parts[1].trim()),
                            Integer.parseInt(parts[2].trim()),
                            Double.parseDouble(parts[3].trim()),
                            Integer.parseInt(parts[4].trim()),
                            Double.parseDouble(parts[5].trim()),
                            Double.parseDouble(parts[6].trim()),
                            Double.parseDouble(parts[7].trim()),
                            Integer.parseInt(parts[8].trim())));
                }
            }
            System.out.println("[HousingDataService] Loaded " + properties.size() + " properties from CSV.");
        } catch (Exception e) {
            System.err.println("[HousingDataService] Failed to load CSV: " + e.getMessage());
        }
    }

    /**
     * Returns all properties as PropertyData (for market dashboard endpoint).
     * Cached so the transformation only happens once.
     */
    @Cacheable("marketData")
    public List<PropertyData> getAllAsPropertyData() {
        return properties.stream()
                .map(p -> new PropertyData(p.id(), (int) p.squareFootage(), p.price(), p.bedrooms(), p.yearBuilt()))
                .collect(Collectors.toList());
    }

    /**
     * Computes and returns aggregate statistics from the dataset.
     * Cached because the dataset is static.
     */
    @Cacheable("aggregateStats")
    public AggregateStats computeStats() {
        if (properties.isEmpty()) {
            return new AggregateStats(0, 0, 0, 0, 0, 0, 0, Collections.emptyMap());
        }

        List<Integer> prices = properties.stream().map(HousingProperty::price).sorted().collect(Collectors.toList());
        int n = prices.size();
        double median = n % 2 == 0
                ? (prices.get(n / 2 - 1) + prices.get(n / 2)) / 2.0
                : prices.get(n / 2);

        double avgPrice = prices.stream().mapToInt(Integer::intValue).average().orElse(0);
        int minPrice = prices.get(0);
        int maxPrice = prices.get(n - 1);
        double avgSqFt = properties.stream().mapToDouble(HousingProperty::squareFootage).average().orElse(0);
        double avgSchool = properties.stream().mapToDouble(HousingProperty::schoolRating).average().orElse(0);

        // avg price per bedroom count
        Map<Integer, Double> avgPriceByBedrooms = properties.stream()
                .collect(Collectors.groupingBy(
                        HousingProperty::bedrooms,
                        Collectors.averagingInt(HousingProperty::price)));

        return new AggregateStats(n, avgPrice, minPrice, maxPrice, median, avgSqFt, avgSchool, avgPriceByBedrooms);
    }

    public List<HousingProperty> getAll() {
        return Collections.unmodifiableList(properties);
    }
}
