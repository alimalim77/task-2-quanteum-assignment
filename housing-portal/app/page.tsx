import Link from "next/link"
import { Calculator, BarChart3, ArrowRight } from "lucide-react"

export default function Home() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl space-y-8">
                <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
                    Quanteum Property Intelligence
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                    A unified portal hosting specialized applications powered by our state-of-the-art housing price prediction ML model.
                </p>

                <div className="pt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">

                    <div className="relative group rounded-2xl border border-border bg-card p-8 shadow-sm transition-all hover:shadow-lg hover:border-primary/50 text-left">
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="p-3 bg-primary/10 rounded-lg text-primary">
                                <Calculator className="h-6 w-6" />
                            </div>
                            <h2 className="text-2xl font-bold">Value Estimator</h2>
                        </div>
                        <p className="text-muted-foreground mb-6 h-12">
                            Predict property values instantly using real-time machine learning inference via Python backend.
                        </p>
                        <Link
                            href="/app1"
                            className="inline-flex items-center text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                        >
                            Launch App 1 <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                    </div>

                    <div className="relative group rounded-2xl border border-border bg-card p-8 shadow-sm transition-all hover:shadow-lg hover:border-blue-500/50 text-left">
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500">
                                <BarChart3 className="h-6 w-6" />
                            </div>
                            <h2 className="text-2xl font-bold">Market Analysis</h2>
                        </div>
                        <p className="text-muted-foreground mb-6 h-12">
                            Explore interactive market trends, segment dashboards, and what-if simulation tools.
                        </p>
                        <Link
                            href="/app2"
                            className="inline-flex items-center text-sm font-semibold text-blue-500 hover:text-blue-400 transition-colors"
                        >
                            Launch App 2 <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    )
}
