"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/shared/Card";
import { PredictionResult } from "@/lib/api";
import { ArrowLeft, Scale, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/shared/Button";

export default function ComparePage() {
    const [history, setHistory] = useState<PredictionResult[]>([]);

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

    const clearHistory = () => {
        if (confirm("Are you sure you want to clear your comparison history?")) {
            localStorage.removeItem("app1_history");
            setHistory([]);
        }
    };

    if (history.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Link href="/app1" className="p-2 rounded-full hover:bg-muted transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">Property Comparison</h1>
                </div>
                <Card className="h-[400px] flex flex-col items-center justify-center text-center p-12 border-dashed bg-muted/30">
                    <Scale className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-lg font-medium text-muted-foreground">No Properties to Compare</h3>
                    <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                        Go back to the Estimator and generate some results first to see them here side-by-side.
                    </p>
                    <Button variant="outline" className="mt-6">
                        <Link href="/app1">Go to Estimator</Link>
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href="/app1" className="p-2 rounded-full hover:bg-muted transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Property Comparison</h1>
                        <p className="text-muted-foreground text-sm">Analysing your {history.length} most recent estimates side-by-side.</p>
                    </div>
                </div>
                <Button variant="destructive" size="sm" onClick={clearHistory}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                </Button>
            </div>

            <Card className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-muted/50 border-b">
                            <th className="p-4 text-left font-semibold text-muted-foreground min-w-[200px]">Feature</th>
                            {history.map((item, i) => (
                                <th key={i} className="p-4 text-center border-l bg-primary/5 min-w-[150px]">
                                    <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Property {i + 1}</div>
                                    <div className="text-lg font-bold text-primary">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(item.prediction)}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground font-normal">
                                        {new Date(item.timestamp).toLocaleDateString()}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        <tr>
                            <td className="p-4 font-medium">Square Footage</td>
                            {history.map((item, i) => (
                                <td key={i} className="p-4 text-center border-l">{item.features.square_footage.toLocaleString()} sqft</td>
                            ))}
                        </tr>
                        <tr>
                            <td className="p-4 font-medium bg-muted/20">Bedrooms / Bathrooms</td>
                            {history.map((item, i) => (
                                <td key={i} className="p-4 text-center border-l bg-muted/20">{item.features.bedrooms} / {item.features.bathrooms}</td>
                            ))}
                        </tr>
                        <tr>
                            <td className="p-4 font-medium">Year Built</td>
                            {history.map((item, i) => (
                                <td key={i} className="p-4 text-center border-l">{item.features.year_built}</td>
                            ))}
                        </tr>
                        <tr>
                            <td className="p-4 font-medium bg-muted/20">Lot Size</td>
                            {history.map((item, i) => (
                                <td key={i} className="p-4 text-center border-l bg-muted/20">{item.features.lot_size.toLocaleString()} sqft</td>
                            ))}
                        </tr>
                        <tr>
                            <td className="p-4 font-medium">Dist to City Center</td>
                            {history.map((item, i) => (
                                <td key={i} className="p-4 text-center border-l">{item.features.distance_to_city_center} miles</td>
                            ))}
                        </tr>
                        <tr>
                            <td className="p-4 font-medium bg-muted/20">School Rating</td>
                            {history.map((item, i) => (
                                <td key={i} className="p-4 text-center border-l bg-muted/20">{item.features.school_rating}/10</td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </Card>
        </div >
    );
}
