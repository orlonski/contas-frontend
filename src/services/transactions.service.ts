import { api } from '@/lib/axios'
import {
  CreateTransactionDto,
  Transaction,
  TransactionFilters,
  UpdateTransactionDto,
} from '@/types'

export const transactionsService = {
  async getAll(filters?: TransactionFilters): Promise<Transaction[]> {
    const response = await api.get<Transaction[]>('/transactions', {
      params: filters,
    })
    return response.data
  },

  async getById(id: string): Promise<Transaction> {
    const response = await api.get<Transaction>(`/transactions/${id}`)
    return response.data
  },

  async getByInvoice(invoiceId: string): Promise<Transaction[]> {
    const response = await api.get<Transaction[]>(`/transactions/invoice/${invoiceId}`)
    return response.data
  },

  async create(data: CreateTransactionDto): Promise<Transaction | Transaction[]> {
    const response = await api.post<Transaction | Transaction[]>('/transactions', data)
    return response.data
  },

  async update(id: string, data: UpdateTransactionDto): Promise<Transaction> {
    const response = await api.patch<Transaction>(`/transactions/${id}`, data)
    return response.data
  },

  async updateSeries(seriesId: string, data: UpdateTransactionDto): Promise<Transaction[]> {
    const response = await api.patch<Transaction[]>(`/transactions/series/${seriesId}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/transactions/${id}`)
  },

  async deleteSeries(seriesId: string): Promise<void> {
    await api.delete(`/transactions/series/${seriesId}`)
  },
}
