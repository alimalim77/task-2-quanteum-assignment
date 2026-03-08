"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/shared/Card"
import { Input, Label } from "@/components/shared/Input"
import { Button } from "@/components/shared/Button"
import {
    ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis,
    CartesianGrid, Tooltip, BarChart, Bar, ZAxis
} from "recharts"
import { DownloadCloud, FileText, Filter, Zap, Loader2, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { fetchMarketData, PropertyData } from "@/lib/api"

// ─── Types ──────────────────────────────────────────────────────────────────
type SortKey = keyof PropertyData
type SortDir = "asc" | "desc"

// ─── Helpers ─────────────────────────────────────────────────────────────────
function exportCSV(data: PropertyData[]) {
    const headers = ["ID", "Sq Ft", "Price ($)", "Bedrooms", "Year Built"]
    const rows = data.map(d => [d.id, d.sqft, d.price, d.beds, d.year])
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "housing_market_data.csv"
    link.click()
    URL.revokeObjectURL(url)
}

async function exportPDF(data: PropertyData[]) {
    // Dynamically import to avoid SSR issues
    const jsPDFModule = await import("jspdf")
    const jsPDF = jsPDFModule.default
    const autoTableModule = await import("jspdf-autotable")
    const autoTable = autoTableModule.default

    const doc = new jsPDF({ orientation: "landscape" })
    doc.setFontSize(16)
    doc.text("Housing Market Data Export", 14, 18)
    doc.setFontSize(10)
    doc.setTextColor(120)
    doc.text(`Generated on ${new Date().toLocaleString()} — ${data.length} records`, 14, 25)

    autoTable(doc, {
        startY: 30,
        head: [["ID", "Sq Ft", "Price ($)", "Bedrooms", "Year Built"]],
        body: data.map(d => [d.id, d.sqft.toLocaleString(), `$${d.price.toLocaleString()}`, d.beds, d.year]),
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        styles: { fontSize: 9, cellPadding: 3 },
    })

    doc.save("housing_market_data.pdf")
}

// ─── Sort Icon ────────────────────────────────────────────────────────────────
function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
    if (col !== sortKey) return <ChevronsUpDown className="h-3 w-3 opacity-30 ml-1 inline" />
    return sortDir === "asc"
        ? <ChevronUp className="h-3 w-3 ml-1 inline text-blue-500" />
        : <ChevronDown className="h-3 w-3 ml-1 inline text-blue-500" />
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MarketDashboard() {
    const [filterYear, setFilterYear] = useState<number>(1950)
    const [filterBeds, setFilterBeds] = useState<number>(0)
    const [searchText, setSearchText] = useState<string>("")
    const [marketData, setMarketData] = useState<PropertyData[]>([])
    const [loading, setLoading] = useState(true)
    const [sortKey, setSortKey] = useState<SortKey>("id")
    const [sortDir, setSortDir] = useState<SortDir>("asc")
    const [currentPage, setCurrentPage] = useState(1)
    const PAGE_SIZE = 10

    useEffect(() => {
        const loadData = async () => {
            setLoading(true)
            const data = await fetchMarketData()
            setMarketData(data)
            setLoading(false)
        }
        loadData()
    }, [])

    // ── Filtered data (for charts) ──
    const filteredData = useMemo(
        () => marketData.filter(d => d.year >= filterYear && d.beds >= filterBeds),
        [marketData, filterYear, filterBeds]
    )

    // ── Table data: filter + search + sort + paginate ──
    const tableFiltered = useMemo(() => {
        const q = searchText.toLowerCase()
        return filteredData.filter(d =>
            d.id.toString().includes(q) ||
            d.sqft.toString().includes(q) ||
            d.price.toString().includes(q) ||
            d.beds.toString().includes(q) ||
            d.year.toString().includes(q)
        )
    }, [filteredData, searchText])

    const tableSorted = useMemo(() => {
        return [...tableFiltered].sort((a, b) => {
            const av = a[sortKey] as number
            const bv = b[sortKey] as number
            return sortDir === "asc" ? av - bv : bv - av
        })
    }, [tableFiltered, sortKey, sortDir])

    const totalPages = Math.max(1, Math.ceil(tableSorted.length / PAGE_SIZE))
    const pagedData = tableSorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

    const handleSort = (key: SortKey) => {
        if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc")
        else { setSortKey(key); setSortDir("asc") }
        setCurrentPage(1)
    }

    // ── Aggregate for Bar Chart ──
    const bedsData = [1, 2, 3, 4, 5].map(b => {
        const subset = marketData.filter(d => d.beds === b)
        const avg = subset.length > 0 ? subset.reduce((acc, curr) => acc + curr.price, 0) / subset.length : 0
        return { beds: b, avgPrice: Math.round(avg) }
    })

    const colDef: { key: SortKey; label: string }[] = [
        { key: "id", label: "ID" },
        { key: "sqft", label: "Sq Ft" },
        { key: "price", label: "Price" },
        { key: "beds", label: "Beds" },
        { key: "year", label: "Year Built" },
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-blue-500">App 2: Market Analysis</h1>
                    <p className="text-muted-foreground">
                        Aggregate housing trends and macro-level visualizations (powered by Java Backend).
                    </p>
                </div>
                <div className="flex gap-2 text-sm flex-wrap">
                    <Link href="/app2/what-if">
                        <Button variant="outline" className="border-blue-500/20 hover:bg-blue-500/10 hover:text-blue-500">
                            <Zap className="mr-2 h-4 w-4" />
                            What-If Simulator
                        </Button>
                    </Link>
                    <Button variant="secondary" onClick={() => exportCSV(filteredData)} disabled={loading}>
                        <DownloadCloud className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                    <Button variant="secondary" onClick={() => exportPDF(filteredData)} disabled={loading}>
                        <FileText className="mr-2 h-4 w-4" />
                        Export PDF
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Filters Sidebar */}
                <Card className="lg:col-span-1 h-fit border-blue-500/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Filter className="h-4 w-4" />
                            Segment Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Built After Year: {filterYear}</Label>
                            <input
                                type="range" min="1950" max="2020"
                                value={filterYear} onChange={(e) => { setFilterYear(parseInt(e.target.value)); setCurrentPage(1) }}
                                className="w-full accent-blue-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Minimum Bedrooms: {filterBeds}</Label>
                            <input
                                type="range" min="0" max="5"
                                value={filterBeds} onChange={(e) => { setFilterBeds(parseInt(e.target.value)); setCurrentPage(1) }}
                                className="w-full accent-blue-500"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground pt-4 border-t">
                            Showing {filteredData.length} of {marketData.length} properties.
                        </p>
                    </CardContent>
                </Card>

                {/* Charts Container */}
                <div className="lg:col-span-3 space-y-6 relative min-h-[600px]">
                    {loading && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-xl border border-blue-500/10">
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                                <p className="text-sm font-medium text-muted-foreground">Fetching Market Analysis...</p>
                            </div>
                        </div>
                    )}
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Price vs. Square Footage</CardTitle>
                                <CardDescription>Correlation scatter analysis based on filtered segment</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                        <XAxis type="number" dataKey="sqft" name="SqFt" unit=" sqft" tick={{ fill: '#888' }} />
                                        <YAxis type="number" dataKey="price" name="Price" tickFormatter={(val) => `$${val / 1000}k`} tick={{ fill: '#888' }} />
                                        <ZAxis range={[50, 50]} />
                                        <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }} />
                                        <Scatter data={filteredData} fill="#3b82f6" />
                                    </ScatterChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Average Price by Bedrooms</CardTitle>
                                <CardDescription>Macro overview of entire dataset</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={bedsData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                                        <XAxis dataKey="beds" tick={{ fill: '#888' }} />
                                        <YAxis tickFormatter={(val) => `$${val / 1000}k`} tick={{ fill: '#888' }} />
                                        <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }} />
                                        <Bar dataKey="avgPrice" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>

            {/* ── Data Table ──────────────────────────────────────────── */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card className="border-blue-500/10">
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <CardTitle>Property Data Table</CardTitle>
                                <CardDescription>
                                    {tableSorted.length} records · Click headers to sort
                                </CardDescription>
                            </div>
                            <div className="w-full sm:w-64">
                                <Input
                                    placeholder="Search table..."
                                    value={searchText}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setSearchText(e.target.value); setCurrentPage(1) }}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto rounded-lg border border-border">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border bg-muted/40">
                                        {colDef.map(col => (
                                            <th
                                                key={col.key}
                                                onClick={() => handleSort(col.key)}
                                                className="px-4 py-3 text-left font-semibold text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors whitespace-nowrap"
                                            >
                                                {col.label}
                                                <SortIcon col={col.key} sortKey={sortKey} sortDir={sortDir} />
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {pagedData.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                                No records match your filters.
                                            </td>
                                        </tr>
                                    ) : (
                                        pagedData.map((row, i) => (
                                            <tr
                                                key={row.id}
                                                className={`border-b border-border/50 transition-colors hover:bg-blue-500/5 ${i % 2 === 0 ? "" : "bg-muted/20"}`}
                                            >
                                                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{row.id}</td>
                                                <td className="px-4 py-3">{row.sqft.toLocaleString()} sqft</td>
                                                <td className="px-4 py-3 font-semibold text-green-400">
                                                    ${row.price.toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                        {row.beds} bd
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">{row.year}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                            <span>
                                Page {currentPage} of {totalPages} · {tableSorted.length} total
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    ← Prev
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next →
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
