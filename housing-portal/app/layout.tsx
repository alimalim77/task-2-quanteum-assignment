import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/layout/Navbar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: "Quanteum Property Portal",
    description: "Unified property value estimation and market analysis",
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className="dark">
            <body className={`${inter.className} min-h-screen flex flex-col antialiased`}>
                <Navbar />
                <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">
                    {children}
                </main>
            </body>
        </html>
    )
}
