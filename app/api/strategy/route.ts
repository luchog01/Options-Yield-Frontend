import { NextResponse } from "next/server"
import type { StrategyResults } from "@/lib/types"

// In-memory storage since no persistence is required
let strategyData: StrategyResults | null = null

export async function POST(req: Request) {
  try {
    const data = await req.json()
    strategyData = data
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON data" }, { status: 400 })
  }
}

export async function GET() {
  // Ensure we're always returning JSON with the correct content type
  return NextResponse.json(strategyData || { results: [], timestamp: 0 }, {
    headers: {
      "Content-Type": "application/json",
    },
  })
}

