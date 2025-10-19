import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { invoicesService } from '@/services'

export function useCardInvoices(creditCardId: string) {
  return useQuery({
    queryKey: ['invoices', 'card', creditCardId],
    queryFn: () => invoicesService.getByCard(creditCardId),
    enabled: !!creditCardId,
  })
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: ['invoices', id],
    queryFn: () => invoicesService.getById(id),
    enabled: !!id,
  })
}

export function useMarkInvoiceAsPaid() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => invoicesService.markAsPaid(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['invoices', id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useCloseInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => invoicesService.close(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['invoices', id] })
    },
  })
}

export function useRecalculateInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => invoicesService.recalculate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['invoices', id] })
    },
  })
}
