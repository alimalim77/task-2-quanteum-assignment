"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/shared/Card"
import { Label } from "@/components/shared/Input"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import { ArrowLeft, Zap, Loader2 } from "lucide-react"
import Link from "next/link"
import { fetchWhatIfSimulation, SimulationResult } from "@/lib/api"

export default function WhatIfSimulator() {
    const [interestRate, setInterestRate] = useState<number>(5.5)
    const [inflationRate, setInflationRate] = useState<number>(3.0)
    const [migrationTrend, setMigrationTrend] = useState<number>(0)
    const [projectionData, setProjectionData] = useState<SimulationResult[]>([])
    const [loading, setLoading] = useState(true)

    const fetchData = useCallback(async () => {
        setLoading(true)
        const data = await fetchWhatIfSimulation({ interestRate, inflationRate, migrationTrend })
        setProjectionData(data)
        setLoading(false)
    }, [interestRate, inflationRate, migrationTrend])

    useEffect(() => {
        const timeout = setTimeout(fetchData, 300) // Debounce API calls
        return () => clearTimeout(timeout)
    }, [fetchData])

    const year5Diff = projectionData.length > 0 ? projectionData[4].projected - projectionData[4].baseline : 0;
    const isPositive = year5Diff >= 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link href="/app2" className="p-2 rounded-full hover:bg-muted transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-blue-500 flex items-center gap-2">
                        <Zap className="h-6 w-6" /> What-If Simulator
                    </h1>
                    <p className="text-muted-foreground">Adjust macroeconomic factors to simulate 5-year housing market projections.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Sliders */}
                <Card className="lg:col-span-1 border-blue-500/20">
                    <CardHeader>
                        <CardTitle>Market Variables</CardTitle>
                        <CardDescription>Drag sliders to update the forecast.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <Label>Interest Rate (%)</Label>
                                <span className="font-mono text-sm text-blue-500">{interestRate.toFixed(1)}%</span>
                            </div>
                            <input
                                type="range" min="1.0" max="12.0" step="0.1"
                                value={interestRate} onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                                className="w-full accent-blue-500"
                            />
                            <p className="text-xs text-muted-foreground">Impacts buyer purchasing power.</p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <Label>Inflation Rate (%)</Label>
                                <span className="font-mono text-sm text-blue-500">{inflationRate.toFixed(1)}%</span>
                            </div>
                            <input
                                type="range" min="-2.0" max="10.0" step="0.1"
                                value={inflationRate} onChange={(e) => setInflationRate(parseFloat(e.target.value))}
                                className="w-full accent-blue-500"
                            />
                            <p className="text-xs text-muted-foreground">Affects base property valuation over time.</p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <Label>Net Migration Trend</Label>
                                <span className="font-mono text-sm text-blue-500">{migrationTrend > 0 ? '+' : ''}{migrationTrend}%</span>
                            </div>
                            <input
                                type="range" min="-50" max="50" step="1"
                                value={migrationTrend} onChange={(e) => setMigrationTrend(parseInt(e.target.value))}
                                className="w-full accent-blue-500"
                            />
                            <p className="text-xs text-muted-foreground">Represents population influx vs outward mobility.</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Chart */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>5-Year Price Projection</CardTitle>
                                <CardDescription>Estimated average home price based on model variables</CardDescription>
                            </div>
                            <div className={`px-4 py-2 rounded-lg font-bold ${isPositive ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                Year 5 Variance: {isPositive ? '+' : ''}{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Math.abs(year5Diff))}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[400px] relative">
                        {loading && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                                <div className="flex flex-col items-center gap-2">
                                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                                    <p className="text-sm font-medium text-muted-foreground">Calculating Projections...</p>
                                </div>
                            </div>
                        )}
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={projectionData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="year" tick={{ fill: '#888' }} axisLine={false} tickLine={false} />
                                <YAxis tickFormatter={(val) => `$${val / 1000}k`} tick={{ fill: '#888' }} domain={['auto', 'auto']} axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ stroke: '#555', strokeWidth: 2, strokeDasharray: '3 3' }}
                                    contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }}
                                    formatter={(value: any) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(value))}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="baseline" name="Status Quo" stroke="#888" strokeWidth={2} strokeDasharray="5 5" />
                                <Line type="monotone" dataKey="projected" name="Simulation" stroke="#3b82f6" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
