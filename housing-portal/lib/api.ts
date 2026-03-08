export interface PropertyFeatures {
    square_footage: number;
    bedrooms: number;
    bathrooms: number;
    year_built: number;
    lot_size: number;
    distance_to_city_center: number;
    school_rating: number;
}

export interface PredictionResult {
    prediction: number;
    features: PropertyFeatures;
    timestamp: string;
}

export const predictPropertyValue = async (features: PropertyFeatures): Promise<PredictionResult> => {
    try {
        // Hit the dedicated App 1 FastAPI service on localhost:8001
        const response = await fetch('http://localhost:8001/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(features),
        });

        if (response.ok) {
            const data = await response.json();
            return {
                prediction: data.prediction,
                features,
                timestamp: new Date().toISOString()
            };
        }
        throw new Error("FastAPI failed, falling back to mock");
    } catch (error) {
        // Mock the python prediction if backend isn't running
        console.warn("Using mock prediction:", error);

        // Simple mock logic: base + (sqft * 200) + (beds * 50000) + (bath * 30000)
        const basePrice = 150000;
        const sqftValue = features.square_footage * 210;
        const bedValue = features.bedrooms * 45000;
        const bathValue = features.bathrooms * 32000;
        const ageDepreciation = (2025 - features.year_built) * 500;
        const schoolBonus = features.school_rating * 15000;
        const locPenalty = features.distance_to_city_center * 5000;

        let mockPrediction = basePrice + sqftValue + bedValue + bathValue - ageDepreciation + schoolBonus - locPenalty;
        // ensure not negative
        mockPrediction = Math.max(80000, mockPrediction);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        return {
            prediction: mockPrediction,
            features,
            timestamp: new Date().toISOString()
        };
    }
}
export interface SimulationParams {
    interestRate: number;
    inflationRate: number;
    migrationTrend: number;
}

export interface SimulationResult {
    year: string;
    baseline: number;
    projected: number;
}

const APPTWO_BACKEND_URL = "http://localhost:8082";

export const fetchWhatIfSimulation = async (params: SimulationParams): Promise<SimulationResult[]> => {
    try {
        const response = await fetch(`${APPTWO_BACKEND_URL}/api/simulate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(params),
        });

        if (!response.ok) {
            throw new Error(`Simulation API error: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Simulation error, using mock fallback:", error);
        // Fallback mock logic for development
        const currentYear = new Date().getFullYear();
        const basePrices = [400000, 415000, 428000, 440000, 455000];

        return basePrices.map((base, i) => {
            const rateImpact = (5.5 - params.interestRate) * 0.02 * base;
            const inflationImpact = (params.inflationRate - 2.0) * 0.015 * base * i;
            const migrationImpact = (params.migrationTrend / 100) * base * (i * 0.5);

            return {
                year: (currentYear + i).toString(),
                baseline: base,
                projected: Math.round(base + rateImpact + inflationImpact + migrationImpact)
            };
        });
    }
};
export interface PropertyData {
    id: number;
    sqft: number;
    price: number;
    beds: number;
    year: number;
}

export const fetchMarketData = async (): Promise<PropertyData[]> => {
    try {
        const response = await fetch(`${APPTWO_BACKEND_URL}/api/simulate/market-data`);
        if (!response.ok) {
            throw new Error(`Market Data API error: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Market Data error, using mock fallback:", error);
        // Minimal fallback logic
        return Array.from({ length: 50 }).map((_, i) => ({
            id: i,
            sqft: 1000 + Math.random() * 3000,
            price: 200000 + Math.random() * 800000,
            beds: 1 + Math.floor(Math.random() * 5),
            year: 1950 + Math.floor(Math.random() * 70)
        }));
    }
};

// ── Aggregate Statistics (Java backend → real CSV data) ──────────────────────
export interface AggregateStats {
    totalProperties: number;
    avgPrice: number;
    minPrice: number;
    maxPrice: number;
    medianPrice: number;
    avgSquareFootage: number;
    avgSchoolRating: number;
    avgPriceByBedrooms: Record<string, number>;
}

export const fetchAggregateStats = async (): Promise<AggregateStats | null> => {
    try {
        const response = await fetch(`${APPTWO_BACKEND_URL}/api/simulate/stats`);
        if (!response.ok) throw new Error(`Stats API error: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error("Stats fetch error:", error);
        return null;
    }
};

// ── ML Model Proxy (via Java backend → FastAPI) ───────────────────────────────
export interface JavaPredictionResult {
    prediction: number;
    source?: string;
    note?: string;
}

export const fetchMLPredictionFromJava = async (features: PropertyFeatures): Promise<JavaPredictionResult> => {
    try {
        const response = await fetch(`${APPTWO_BACKEND_URL}/api/simulate/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                square_footage: features.square_footage,
                bedrooms: features.bedrooms,
                bathrooms: features.bathrooms,
                year_built: features.year_built,
                lot_size: features.lot_size,
                distance_to_city_center: features.distance_to_city_center,
                school_rating: features.school_rating,
            }),
        });
        if (!response.ok) throw new Error(`Java predict API error: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error("Java ML proxy error:", error);
        return { prediction: 0, source: 'error', note: 'Could not reach Java backend.' };
    }
};
