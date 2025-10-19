import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { accountsService } from '@/services'
import { CreateAccountDto, UpdateAccountDto } from '@/types'

export function useAccounts(activeOnly?: boolean) {
  return useQuery({
    queryKey: ['accounts', { activeOnly }],
    queryFn: () => accountsService.getAll(activeOnly),
  })
}

export function useAccount(id: string) {
  return useQuery({
    queryKey: ['accounts', id],
    queryFn: () => accountsService.getById(id),
    enabled: !!id,
  })
}

export function useAccountBalance(id: string) {
  return useQuery({
    queryKey: ['accounts', id, 'balance'],
    queryFn: () => accountsService.getBalance(id),
    enabled: !!id,
  })
}

export function useCreateAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateAccountDto) => accountsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdateAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAccountDto }) =>
      accountsService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['accounts', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useDeleteAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => accountsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}
