export enum StrategyType {
  COVERED_CALL = "COVERED_CALL",
  NO_RISK_STRATEGY = "NO_RISK_STRATEGY"
}

export const strategyTypeShort = {
  [StrategyType.COVERED_CALL]: "CC",
  [StrategyType.NO_RISK_STRATEGY]: "NR",
}

export interface Asset {
  ticker: string
  quantity: number
  price: number
}

export interface StrategyResult {
  type: StrategyType
  ticker: string
  initial_cost: number
  high_underlying_payoff_percentage: number
  breakeven_price: number
  strike: number
  assets: Asset[]
}

export interface StrategyResults {
  results: StrategyResult[]
  timestamp: number
}
