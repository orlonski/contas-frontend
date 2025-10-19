import { api } from '@/lib/axios'
import { Account, AccountBalance, CreateAccountDto, UpdateAccountDto } from '@/types'

export const accountsService = {
  async getAll(activeOnly?: boolean): Promise<Account[]> {
    const response = await api.get<Account[]>('/accounts', {
      params: { activeOnly },
    })
    return response.data
  },

  async getById(id: string): Promise<Account> {
    const response = await api.get<Account>(`/accounts/${id}`)
    return response.data
  },

  async getBalance(id: string): Promise<AccountBalance> {
    const response = await api.get<AccountBalance>(`/accounts/${id}/balance`)
    return response.data
  },

  async create(data: CreateAccountDto): Promise<Account> {
    const response = await api.post<Account>('/accounts', data)
    return response.data
  },

  async update(id: string, data: UpdateAccountDto): Promise<Account> {
    const response = await api.patch<Account>(`/accounts/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/accounts/${id}`)
  },
}
