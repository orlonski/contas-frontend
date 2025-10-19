import { api } from '@/lib/axios'
import { Invoice, InvoiceDetail } from '@/types'

export const invoicesService = {
  async getByCard(creditCardId: string): Promise<Invoice[]> {
    console.log('🔍 Fetching invoices for card:', creditCardId)
    const response = await api.get<Invoice[]>(`/invoices/card/${creditCardId}`)
    console.log('📋 Invoices received from backend:', response.data)
    return response.data
  },

  async getById(id: string): Promise<InvoiceDetail> {
    const response = await api.get<InvoiceDetail>(`/invoices/${id}`)
    return response.data
  },

  async markAsPaid(id: string): Promise<Invoice> {
    const response = await api.patch<Invoice>(`/invoices/${id}/pay`)
    return response.data
  },

  async close(id: string): Promise<Invoice> {
    const response = await api.patch<Invoice>(`/invoices/${id}/close`)
    return response.data
  },

  async recalculate(id: string): Promise<Invoice> {
    const response = await api.patch<Invoice>(`/invoices/${id}/recalculate`)
    return response.data
  },
}
