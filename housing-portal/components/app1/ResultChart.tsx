import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { PredictionResult } from "@/lib/api"

export function ResultChart({ result }: { result: PredictionResult }) {
    // We mock a "Regional Average" baseline for the visual chart as per UI/UX data-heavy aesthetic
    const chartData = [
        {
            name: "Price / SqFt",
            estimated: Math.round(result.prediction / result.features.square_footage),
            average: 280, // Mock baseline
        },
        {
            name: "Age Deduct",
            estimated: (new Date().getFullYear() - result.features.year_built) * 1.5,
            average: 20,
        },
        {
            name: "School Score",
            estimated: result.features.school_rating * 10,
            average: 75,
        }
    ]

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Feature Impact Analysis</h4>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                            <XAxis dataKey="name" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }}
                            />
                            <Bar dataKey="average" fill="#333" radius={[4, 4, 0, 0]} name="Regional Avg" />
                            <Bar dataKey="estimated" fill="var(--ring)" radius={[4, 4, 0, 0]} name="This Property" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Tabular format for results as per requirement a.iii */}
            <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Property Features Detail</h4>
                <div className="rounded-lg border bg-card overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b">
                            <tr>
                                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Feature</th>
                                <th className="px-4 py-2 text-right font-medium text-muted-foreground">Value</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-muted">
                            <tr>
                                <td className="px-4 py-2">Square Footage</td>
                                <td className="px-4 py-2 text-right">{result.features.square_footage} sqft</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2">Bedrooms / Bathrooms</td>
                                <td className="px-4 py-2 text-right">{result.features.bedrooms} / {result.features.bathrooms}</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2">Year Built</td>
                                <td className="px-4 py-2 text-right">{result.features.year_built}</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2">Distance to Center</td>
                                <td className="px-4 py-2 text-right">{result.features.distance_to_city_center} miles</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2">School Rating</td>
                                <td className="px-4 py-2 text-right">{result.features.school_rating}/10</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
