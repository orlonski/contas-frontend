import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '@/services'
import { PeriodFilter } from '@/types'

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: () => dashboardService.getSummary(),
  })
}

export function useConsolidatedBalance() {
  return useQuery({
    queryKey: ['dashboard', 'consolidated-balance'],
    queryFn: () => dashboardService.getConsolidatedBalance(),
  })
}

export function usePeriodResult(filter?: PeriodFilter) {
  return useQuery({
    queryKey: ['dashboard', 'period-result', filter],
    queryFn: () => dashboardService.getPeriodResult(filter),
  })
}

export function useExpensesByCategory(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['dashboard', 'expenses-by-category', { startDate, endDate }],
    queryFn: () => dashboardService.getExpensesByCategory({ startDate, endDate }),
    enabled: !!startDate && !!endDate,
  })
}

export function useCashFlow(startDate?: string, endDate?: string) {
  // For now, we'll use the months parameter, but ideally backend should support start/end dates
  return useQuery({
    queryKey: ['dashboard', 'cash-flow', { startDate, endDate }],
    queryFn: () => dashboardService.getCashFlow(1), // 1 month for now
    enabled: !!startDate && !!endDate,
  })
}

export function usePeriodTransactions(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['transactions', 'period', { startDate, endDate }],
    queryFn: async () => {
      const { transactionsService } = await import('@/services')
      return transactionsService.getAll({ startDate, endDate })
    },
    enabled: !!startDate && !!endDate,
  })
}
