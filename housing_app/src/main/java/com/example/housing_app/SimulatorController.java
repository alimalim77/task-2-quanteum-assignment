package com.example.housing_app;

import org.springframework.web.bind.annotation.*;

import java.time.Year;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for App 2 — Property Market Analysis.
 *
 * Endpoints:
 * POST /api/simulate — What-If 5-year price projection
 * GET /api/simulate/market-data — Real property data from CSV (cached)
 * GET /api/simulate/stats — Aggregate statistics from CSV (cached)
 * POST /api/simulate/predict — ML model proxy to FastAPI (cached)
 */
@RestController
@RequestMapping("/api/simulate")
@CrossOrigin(origins = "http://localhost:3000")
public class SimulatorController {

    private final HousingDataService housingDataService;
    private final MlModelService mlModelService;

    public SimulatorController(HousingDataService housingDataService, MlModelService mlModelService) {
        this.housingDataService = housingDataService;
        this.mlModelService = mlModelService;
    }

    // ── 1. What-If Simulator ─────────────────────────────────────────────────

    /**
     * POST /api/simulate
     * Calculates 5-year projections based on macroeconomic factors.
     */
    @PostMapping
    public List<SimulationResponse> simulate(@RequestBody SimulationRequest request) {
        double interestRate = request.interestRate();
        double inflationRate = request.inflationRate();
        double migrationTrend = request.migrationTrend();

        double[] basePrices = { 400000, 415000, 428000, 440000, 455000 };
        List<SimulationResponse> results = new ArrayList<>();
        int currentYear = Year.now().getValue();

        for (int i = 0; i < basePrices.length; i++) {
            double base = basePrices[i];
            double rateImpact = (5.5 - interestRate) * 0.02 * base;
            double inflationImpact = (inflationRate - 2.0) * 0.015 * base * i;
            double migrationImpact = (migrationTrend / 100.0) * base * (i * 0.5);
            double projected = base + rateImpact + inflationImpact + migrationImpact;

            results.add(new SimulationResponse(
                    String.valueOf(currentYear + i),
                    (int) base,
                    (int) Math.round(projected)));
        }
        return results;
    }

    // ── 2. Real Market Data from CSV ─────────────────────────────────────────

    /**
     * GET /api/simulate/market-data
     * Returns property records loaded from the real housing CSV.
     * Cached by Caffeine — no repeated disk reads.
     */
    @GetMapping("/market-data")
    public List<PropertyData> getMarketData() {
        return housingDataService.getAllAsPropertyData();
    }

    // ── 3. Aggregate Statistics ───────────────────────────────────────────────

    /**
     * GET /api/simulate/stats
     * Returns aggregate statistics computed from the real CSV dataset.
     * Cached — computed once per application lifecycle.
     */
    @GetMapping("/stats")
    public AggregateStats getStats() {
        return housingDataService.computeStats();
    }

    // ── 4. ML Model Proxy ─────────────────────────────────────────────────────

    /**
     * POST /api/simulate/predict
     * Proxies the request to the FastAPI ML container on port 8001.
     * Falls back to a heuristic formula if the container is offline.
     * Results are cached by key features to avoid redundant model calls.
     */
    @PostMapping("/predict")
    public Map<String, Object> predict(@RequestBody PredictionRequest request) {
        return mlModelService.predict(request);
    }
}
