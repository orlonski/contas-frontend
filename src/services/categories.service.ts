import { api } from '@/lib/axios'
import { Category, CategoryTree, CreateCategoryDto, UpdateCategoryDto } from '@/types'

export const categoriesService = {
  async getAll(): Promise<Category[]> {
    const response = await api.get<Category[]>('/categories')
    return response.data
  },

  async getTree(): Promise<CategoryTree[]> {
    const response = await api.get<CategoryTree[]>('/categories/tree')
    return response.data
  },

  async getById(id: string): Promise<Category> {
    const response = await api.get<Category>(`/categories/${id}`)
    return response.data
  },

  async create(data: CreateCategoryDto): Promise<Category> {
    const response = await api.post<Category>('/categories', data)
    return response.data
  },

  async update(id: string, data: UpdateCategoryDto): Promise<Category> {
    const response = await api.patch<Category>(`/categories/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/categories/${id}`)
  },
}
