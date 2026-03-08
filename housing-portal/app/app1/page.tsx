import ValueEstimator from "@/components/app1/ValueEstimator";

export default function App1Page() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">App 1: Value Estimator</h1>
                <p className="text-muted-foreground">
                    Real-time prediction using the Python ML Model. Input features to get an immediate market value estimate.
                </p>
            </div>

            <ValueEstimator />
        </div>
    )
}
