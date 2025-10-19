import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { transactionsService } from '@/services'
import { CreateTransactionDto, TransactionFilters, UpdateTransactionDto } from '@/types'

export function useTransactions(filters?: TransactionFilters) {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => transactionsService.getAll(filters),
  })
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: ['transactions', id],
    queryFn: () => transactionsService.getById(id),
    enabled: !!id,
  })
}

export function useInvoiceTransactions(invoiceId: string) {
  return useQuery({
    queryKey: ['transactions', 'invoice', invoiceId],
    queryFn: () => transactionsService.getByInvoice(invoiceId),
    enabled: !!invoiceId,
  })
}

export function useCreateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTransactionDto) => transactionsService.create(data),
    onSuccess: async () => {
      // Invalidate and refetch all related queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['transactions'] }),
        queryClient.invalidateQueries({ queryKey: ['accounts'] }),
        queryClient.invalidateQueries({ queryKey: ['invoices'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      ])

      // Force refetch invoices to ensure UI updates
      await queryClient.refetchQueries({
        queryKey: ['invoices'],
        type: 'active'
      })
    },
  })
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTransactionDto }) =>
      transactionsService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['transactions', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdateTransactionSeries() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ seriesId, data }: { seriesId: string; data: UpdateTransactionDto }) =>
      transactionsService.updateSeries(seriesId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => transactionsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useDeleteTransactionSeries() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (seriesId: string) => transactionsService.deleteSeries(seriesId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
