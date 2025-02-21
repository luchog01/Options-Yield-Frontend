import { StrategyResults } from "@/components/strategy-results"
import type { StrategyResults as StrategyResultsType } from "@/lib/types"

async function getStrategyData() {
  try {
    // Construct absolute URL based on environment
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"

    const res = await fetch(`${baseUrl}/api/strategy`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    })

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    const data: StrategyResultsType = await res.json()
    return data
  } catch (error) {
    console.error("Error fetching strategy data:", error)
    // Return empty data structure on error
    return { results: [], timestamp: 0 }
  }
}

export default async function Page() {
  const data = await getStrategyData()

  return (
    <main className="container mx-auto py-10 px-4">
      <StrategyResults initialData={data} />
    </main>
  )
}
