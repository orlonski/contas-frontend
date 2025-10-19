import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { categoriesService } from '@/services'
import { CreateCategoryDto, UpdateCategoryDto } from '@/types'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesService.getAll(),
  })
}

export function useCategoriesTree() {
  return useQuery({
    queryKey: ['categories', 'tree'],
    queryFn: () => categoriesService.getTree(),
  })
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: ['categories', id],
    queryFn: () => categoriesService.getById(id),
    enabled: !!id,
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCategoryDto) => categoriesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryDto }) =>
      categoriesService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['categories', variables.id] })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => categoriesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}
