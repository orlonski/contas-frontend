import { api } from '@/lib/axios'
import {
  CashFlowResponse,
  ConsolidatedBalance,
  DashboardSummary,
  ExpensesByCategoryResponse,
  PeriodFilter,
  PeriodResult,
} from '@/types'

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    const response = await api.get<DashboardSummary>('/dashboard/summary')
    return response.data
  },

  async getConsolidatedBalance(): Promise<ConsolidatedBalance> {
    const response = await api.get<ConsolidatedBalance>('/dashboard/consolidated-balance')
    return response.data
  },

  async getPeriodResult(filter?: PeriodFilter): Promise<PeriodResult> {
    const response = await api.get<PeriodResult>('/dashboard/period-result', {
      params: { filter },
    })
    return response.data
  },

  async getExpensesByCategory(params?: {
    startDate?: string
    endDate?: string
  }): Promise<ExpensesByCategoryResponse> {
    const response = await api.get<ExpensesByCategoryResponse>(
      '/dashboard/expenses-by-category',
      { params }
    )
    return response.data
  },

  async getCashFlow(months?: number): Promise<CashFlowResponse> {
    const response = await api.get<CashFlowResponse>('/dashboard/cash-flow', {
      params: { months },
    })
    return response.data
  },
}
