"use client"

import { useState } from "react"
import { StrategyTable } from "@/components/strategy-table"
import type { StrategyResults } from "@/lib/types"

async function getStrategyData() {
  try {
    const res = await fetch('/api/strategy', {
      headers: {
        Accept: "application/json",
      },
    })

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    const data: StrategyResults = await res.json()
    return data
  } catch (error) {
    console.error("Error fetching strategy data:", error)
    return { results: [], timestamp: 0 }
  }
}

interface StrategyResultsProps {
  initialData: StrategyResults
}

export function StrategyResults({ initialData }: StrategyResultsProps) {
  const [timestamp, setTimestamp] = useState(initialData.timestamp)

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Strategy Results</h1>
        {timestamp > 0 && (
          <div className="text-muted-foreground">
            Last updated: {new Date(timestamp * 1000).toLocaleString()}
          </div>
        )}
      </div>
      <StrategyTable 
        initialData={initialData.results} 
        onRefresh={async () => {
          const data = await getStrategyData()
          setTimestamp(data.timestamp)
          return data.results
        }}
      />
    </div>
  )
}
