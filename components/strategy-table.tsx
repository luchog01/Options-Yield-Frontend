"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { StrategyResult, StrategyType, Asset } from "@/lib/types"
import { strategyTypeShort } from "@/lib/types"
import { playAlertSound } from "@/lib/sound"

interface StrategyTableProps {
  initialData: StrategyResult[]
  onRefresh: () => Promise<StrategyResult[]>
}

type SortConfig = {
  key: keyof StrategyResult
  direction: "asc" | "desc"
  priority: number
}[]

export function StrategyTable({ initialData, onRefresh }: StrategyTableProps) {
  const [data, setData] = useState(initialData)
  const [sortConfig, setSortConfig] = useState<SortConfig>([])
  const [isLoading, setIsLoading] = useState(false)
  const [payoffThreshold, setPayoffThreshold] = useState(0.07) // 7% default threshold

  const applySort = (items: StrategyResult[]) => {
    if (sortConfig.length === 0) return items

    return [...items].sort((a, b) => {
      for (const { key, direction } of sortConfig) {
        if (a[key] < b[key]) return direction === "asc" ? -1 : 1
        if (a[key] > b[key]) return direction === "asc" ? 1 : -1
      }
      return 0
    })
  }

  useEffect(() => {
    const refreshData = async () => {
      try {
        setIsLoading(true)
        const newData = await onRefresh()
        const sortedData = applySort(newData)
        
        // Check for high-payoff no-risk strategies
        const highPayoffNoRisk = sortedData.find(
          strategy => 
            strategy.type === "NO_RISK_STRATEGY" && 
            strategy.high_underlying_payoff_percentage > payoffThreshold
        )
        
        if (highPayoffNoRisk) {
          playAlertSound()
        }
        
        setData(sortedData)
      } catch (error) {
        console.error('Failed to refresh data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    // Initial refresh
    refreshData()

    // Set up the interval
    const intervalId = setInterval(refreshData, 5000) // 5 seconds

    // Cleanup on unmount
    return () => clearInterval(intervalId)
  }, [onRefresh, sortConfig, payoffThreshold])

  // Apply sort whenever sortConfig changes
  useEffect(() => {
    setData(prevData => applySort([...prevData]))
  }, [sortConfig])

  const sortData = (key: keyof StrategyResult) => {
    setSortConfig(prevConfig => {
      const existingSort = prevConfig.find(config => config.key === key)
      const otherSorts = prevConfig.filter(config => config.key !== key)
      
      if (existingSort) {
        // If already sorting by this key, toggle direction or remove if it was desc
        if (existingSort.direction === "asc") {
          return [
            ...otherSorts,
            { key, direction: "desc", priority: existingSort.priority }
          ].sort((a, b) => a.priority - b.priority)
        } else {
          // Remove this sort criteria and update priorities
          return otherSorts.map((sort, index) => ({
            ...sort,
            priority: index
          }))
        }
      } else {
        // Add new sort criteria
        return [
          ...otherSorts,
          { key, direction: "asc", priority: prevConfig.length }
        ].sort((a, b) => a.priority - b.priority)
      }
    })
  }

  const getSortIndicator = (key: keyof StrategyResult) => {
    const sort = sortConfig.find(config => config.key === key)
    if (!sort) return null

    const priority = sortConfig.length > 1 ? sort.priority + 1 : ""
    const arrow = sort.direction === "asc" ? "↑" : "↓"
    return `${arrow}${priority}`
  }

  const formatPercentage = (value: number) => `${(value * 100).toFixed(2)}%`
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)

  const getStrategyInitials = (type: StrategyType): string => {
    return strategyTypeShort[type] || type
  }

  const formatAsset = (asset: Asset) => {
    return `${asset.quantity}x ${asset.ticker} @ ${formatCurrency(asset.price)}`
  }

  return (
    <div className="rounded-md border relative">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label htmlFor="threshold" className="text-sm font-medium">
            Alert Threshold:
          </label>
          <Input
            id="threshold"
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={(payoffThreshold * 100).toFixed(1)}
            onChange={(e) => setPayoffThreshold(Number(e.target.value) / 100)}
            className="w-24"
          />
          <span className="text-sm text-muted-foreground">%</span>
        </div>
        {isLoading && (
          <div className="text-sm text-muted-foreground">
            Refreshing...
          </div>
        )}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center p-0">
              <Button
                variant="ghost"
                onClick={() => sortData("high_underlying_payoff_percentage")}
                className="font-bold text-lg h-full w-full flex items-center justify-center m-0 px-2"
              >
                <span className="inline-flex items-center gap-2">
                  Payoff % {getSortIndicator("high_underlying_payoff_percentage")}
                  <ArrowUpDown className="h-4 w-4" />
                </span>
              </Button>
            </TableHead>
            <TableHead className="text-center p-0">
              <Button variant="ghost" onClick={() => sortData("type")} className="font-bold text-lg h-full w-full flex items-center justify-center m-0 px-2">
                <span className="inline-flex items-center gap-2">
                  Strategy {getSortIndicator("type")}
                  <ArrowUpDown className="h-4 w-4" />
                </span>
              </Button>
            </TableHead>
            <TableHead className="text-center p-0">
              <Button variant="ghost" onClick={() => sortData("strike")} className="font-bold text-lg h-full w-full flex items-center justify-center m-0 px-2">
                <span className="inline-flex items-center gap-2">
                  Strike {getSortIndicator("strike")}
                  <ArrowUpDown className="h-4 w-4" />
                </span>
              </Button>
            </TableHead>
            <TableHead className="text-center p-0">
              <Button variant="ghost" onClick={() => sortData("ticker")} className="font-bold text-lg h-full w-full flex items-center justify-center m-0 px-2">
                <span className="inline-flex items-center gap-2">
                  Ticker {getSortIndicator("ticker")}
                  <ArrowUpDown className="h-4 w-4" />
                </span>
              </Button>
            </TableHead>
            <TableHead className="text-center p-4">
              <span className="font-bold text-lg">Assets</span>
            </TableHead>
            <TableHead className="text-center p-0">
              <Button variant="ghost" onClick={() => sortData("breakeven_price")} className="font-bold text-lg h-full w-full flex items-center justify-center m-0 px-2">
                <span className="inline-flex items-center gap-2">
                  Breakeven {getSortIndicator("breakeven_price")}
                  <ArrowUpDown className="h-4 w-4" />
                </span>
              </Button>
            </TableHead>
            <TableHead className="text-center p-0">
              <Button variant="ghost" onClick={() => sortData("initial_cost")} className="font-bold text-lg h-full w-full flex items-center justify-center m-0 px-2">
                <span className="inline-flex items-center gap-2">
                  Initial Cost {getSortIndicator("initial_cost")}
                  <ArrowUpDown className="h-4 w-4" />
                </span>
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((result, index) => (
            <TableRow key={index}>
              <TableCell className="text-base text-center">{formatPercentage(result.high_underlying_payoff_percentage)}</TableCell>
              <TableCell className="text-base text-center">{getStrategyInitials(result.type)}</TableCell>
              <TableCell className="text-base text-center">{formatCurrency(result.strike)}</TableCell>
              <TableCell className="text-base text-center">{result.ticker}</TableCell>
              <TableCell className="text-base">
                <div className="flex flex-col gap-1 items-center">
                  {result.assets.map((asset, assetIndex) => (
                    <div key={assetIndex}>{formatAsset(asset)}</div>
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-base text-center">{formatCurrency(result.breakeven_price)}</TableCell>
              <TableCell className="text-base text-center">{formatCurrency(result.initial_cost)}</TableCell>
            </TableRow>
          ))}
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-16 text-xl text-muted-foreground">
                No data available yet. Send data to the API endpoint to populate the table.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
