"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/shared/Card";
import { Button } from "@/components/shared/Button";
import { Input, Label } from "@/components/shared/Input";
import { predictPropertyValue, PropertyFeatures, PredictionResult } from "@/lib/api";
import { ResultChart } from "./ResultChart";
import { Loader2, TrendingUp, History, Calculator } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ValueEstimator() {
    const [formData, setFormData] = useState<PropertyFeatures>({
        square_footage: 2000,
        bedrooms: 3,
        bathrooms: 2,
        year_built: 2010,
        lot_size: 5000,
        distance_to_city_center: 10,
        school_rating: 8,
    });

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<PredictionResult | null>(null);
    const [history, setHistory] = useState<PredictionResult[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Load history from localStorage on initial mount
    useEffect(() => {
        const savedHistory = localStorage.getItem("app1_history");
        if (savedHistory) {
            try {
                setHistory(JSON.parse(savedHistory));
            } catch (e) {
                console.error("Failed to load history", e);
            }
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: parseFloat(value) || 0,
        }));
        setError(null);
    };

    const validate = () => {
        if (formData.square_footage <= 0) return "Square footage must be positive.";
        if (formData.bedrooms < 0) return "Bedrooms cannot be negative.";
        if (formData.bathrooms < 0) return "Bathrooms cannot be negative.";
        if (formData.year_built < 1800 || formData.year_built > new Date().getFullYear()) return "Invalid year built.";
        if (formData.school_rating < 0 || formData.school_rating > 10) return "School rating must be between 0 and 10.";
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await predictPropertyValue(formData);
            setResult(res);

            const newHistory = [res, ...history].slice(0, 10);
            setHistory(newHistory);
            localStorage.setItem("app1_history", JSON.stringify(newHistory));
        } catch (err: any) {
            setError(err.message || "Failed to predict property value.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form Column */}
            <div className="lg:col-span-5 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            Property Details
                        </CardTitle>
                        <CardDescription>
                            Enter the features of the property to get an AI-powered value estimation.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 col-span-2">
                                    <Label htmlFor="square_footage">Square Footage (sqft)</Label>
                                    <Input id="square_footage" name="square_footage" type="number" value={formData.square_footage || ''} onChange={handleChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bedrooms">Bedrooms</Label>
                                    <Input id="bedrooms" name="bedrooms" type="number" step="1" value={formData.bedrooms || ''} onChange={handleChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bathrooms">Bathrooms</Label>
                                    <Input id="bathrooms" name="bathrooms" type="number" step="0.5" value={formData.bathrooms || ''} onChange={handleChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="year_built">Year Built</Label>
                                    <Input id="year_built" name="year_built" type="number" value={formData.year_built || ''} onChange={handleChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lot_size">Lot Size (sqft)</Label>
                                    <Input id="lot_size" name="lot_size" type="number" value={formData.lot_size || ''} onChange={handleChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="distance_to_city_center">Dist to City Center (miles)</Label>
                                    <Input id="distance_to_city_center" name="distance_to_city_center" type="number" step="0.1" value={formData.distance_to_city_center || ''} onChange={handleChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="school_rating">School Rating (1-10)</Label>
                                    <Input id="school_rating" name="school_rating" type="number" step="0.1" max="10" min="0" value={formData.school_rating || ''} onChange={handleChange} required />
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                                    {error}
                                </div>
                            )}

                            <Button type="submit" className="w-full mt-6" disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {loading ? "Calculating..." : "Estimate Value"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* Results & History Column */}
            <div className="lg:col-span-7 space-y-6">
                {result ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                        <Card className="border-primary/50 shadow-lg shadow-primary/5 overflow-hidden">
                            <div className="bg-primary/10 p-6 border-b border-primary/20 text-center">
                                <p className="text-sm font-medium text-primary uppercase tracking-wider mb-2">Estimated Value</p>
                                <h2 className="text-5xl font-extrabold tracking-tight">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(result.prediction)}
                                </h2>
                            </div>
                            <CardContent className="p-6">
                                <ResultChart result={result} />
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : (
                    <Card className="h-full flex flex-col items-center justify-center p-12 text-center border-dashed bg-muted/30 min-h-[400px]">
                        <Calculator className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                        <h3 className="text-lg font-medium text-muted-foreground">No Estimation Yet</h3>
                        <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                            Fill out the property details on the left to see the machine learning model's prediction here.
                        </p>
                    </Card>
                )}

                {history.length > 0 && (
                    <Card>
                        <CardHeader className="pb-3 border-b">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <History className="h-4 w-4 text-muted-foreground" />
                                    Recent Estimates
                                </CardTitle>
                                <Link href="/app1/compare" className="text-sm text-primary hover:underline">
                                    Compare Multiple
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="space-y-3">
                                {history.slice(0, 3).map((item, i) => (
                                    <div key={i} className="flex justify-between items-center p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                                        <div>
                                            <p className="font-medium text-sm">
                                                {item.features.bedrooms} Bed, {item.features.bathrooms} Bath
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {item.features.square_footage} sqft • Built {item.features.year_built}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-primary">
                                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(item.prediction)}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground">
                                                {new Date(item.timestamp).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
