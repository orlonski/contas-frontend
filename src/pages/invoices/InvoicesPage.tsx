import { useState, useEffect } from 'react'
import { useCardInvoices, useMarkInvoiceAsPaid, useRecalculateInvoice, useAccounts } from '@/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import {
  Receipt,
  CreditCard,
  Check,
  Clock,
  XCircle,
  ChevronRight,
  Calendar,
  DollarSign,
  RefreshCw,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { AccountType, InvoiceStatus, Invoice } from '@/types'
import toast from 'react-hot-toast'

export function InvoicesPage() {
  const [selectedAccountId, setSelectedAccountId] = useState<string>('')
  const { data: accounts, isLoading: loadingAccounts } = useAccounts(true)
  const { data: invoices, isLoading: loadingInvoices, refetch } = useCardInvoices(selectedAccountId)
  const { mutate: markAsPaid } = useMarkInvoiceAsPaid()
  const { mutate: recalculate } = useRecalculateInvoice()

  // Filter only credit card accounts
  const creditCardAccounts = accounts?.filter((acc) => acc.type === AccountType.CREDIT_CARD)

  // Auto-select first credit card when loaded
  useEffect(() => {
    if (!selectedAccountId && creditCardAccounts && creditCardAccounts.length > 0) {
      setSelectedAccountId(creditCardAccounts[0].id)
    }
  }, [creditCardAccounts, selectedAccountId])

  // Debug: log invoices data
  useEffect(() => {
    if (invoices) {
      console.log('💳 Invoices in component:', {
        count: invoices.length,
        invoices: invoices.map(inv => ({
          id: inv.id,
          month: inv.month,
          year: inv.year,
          status: inv.status,
          totalAmount: inv.totalAmount,
          calculatedTotal: inv.calculatedTotal,
          hasTransactions: inv.transactions?.length || 0
        }))
      })
    }
  }, [invoices])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const getStatusIcon = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.PAID:
        return <Check className="h-5 w-5 text-green-600" />
      case InvoiceStatus.OPEN:
        return <Clock className="h-5 w-5 text-blue-600" />
      case InvoiceStatus.CLOSED:
        return <XCircle className="h-5 w-5 text-orange-600" />
      default:
        return <Receipt className="h-5 w-5" />
    }
  }

  const getStatusLabel = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.PAID:
        return 'Paga'
      case InvoiceStatus.OPEN:
        return 'Aberta'
      case InvoiceStatus.CLOSED:
        return 'Fechada'
      default:
        return status
    }
  }

  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.PAID:
        return 'bg-green-100 text-green-800'
      case InvoiceStatus.OPEN:
        return 'bg-blue-100 text-blue-800'
      case InvoiceStatus.CLOSED:
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleMarkAsPaid = (invoiceId: string) => {
    if (confirm('Deseja marcar esta fatura como paga?')) {
      markAsPaid(invoiceId, {
        onSuccess: () => {
          toast.success('Fatura marcada como paga!')
          refetch()
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || 'Erro ao marcar fatura como paga')
        },
      })
    }
  }

  const handleRecalculate = (invoiceId: string) => {
    recalculate(invoiceId, {
      onSuccess: () => {
        toast.success('Fatura recalculada com sucesso!')
        refetch()
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao recalcular fatura')
      },
    })
  }

  const isLoading = loadingAccounts || loadingInvoices

  if (loadingAccounts) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Faturas de Cartão</h1>
          <p className="text-muted-foreground">Gerencie as faturas dos seus cartões de crédito</p>
        </div>
      </div>

      {/* Account Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="max-w-md">
            <Label htmlFor="account-filter">Selecione um Cartão de Crédito</Label>
            <Select
              id="account-filter"
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
            >
              <option value="">Todos os cartões</option>
              {creditCardAccounts?.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} - {acc.bank || 'Sem banco'}
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* No Credit Cards */}
      {creditCardAccounts?.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum cartão de crédito cadastrado</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Cadastre um cartão de crédito para visualizar faturas
            </p>
          </CardContent>
        </Card>
      )}

      {/* Invoices List */}
      {creditCardAccounts && creditCardAccounts.length > 0 && (
        <>
          {loadingInvoices ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Carregando faturas...</p>
                </div>
              </CardContent>
            </Card>
          ) : invoices && invoices.length > 0 ? (
            <div className="grid gap-4">
              {invoices.map((invoice: Invoice) => (
                <Card key={invoice.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          <Receipt className="h-5 w-5" />
                          Fatura de {format(new Date(invoice.month + '/01/' + invoice.year), 'MMMM yyyy', { locale: ptBR })}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {invoice.account?.name || 'Cartão'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            invoice.status
                          )}`}
                        >
                          {getStatusIcon(invoice.status)}
                          {getStatusLabel(invoice.status)}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Closing Date */}
                      <div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Fechamento
                        </p>
                        <p className="font-medium">
                          {format(new Date(invoice.closingDate), 'dd/MM/yyyy')}
                        </p>
                      </div>

                      {/* Due Date */}
                      <div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Vencimento
                        </p>
                        <p className="font-medium">
                          {format(new Date(invoice.dueDate), 'dd/MM/yyyy')}
                        </p>
                      </div>

                      {/* Total Amount */}
                      <div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          Valor Total
                        </p>
                        <p className="text-xl font-bold text-red-600">
                          {formatCurrency(
                            invoice.calculatedTotal ||
                            invoice.totalAmount ||
                            invoice.transactions?.reduce((sum, tx) => sum + Math.abs(tx.amount), 0) ||
                            0
                          )}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col items-end justify-end gap-2">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRecalculate(invoice.id)}
                            title="Recalcular valor da fatura"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          {invoice.status === InvoiceStatus.CLOSED && (
                            <Button
                              size="sm"
                              onClick={() => handleMarkAsPaid(invoice.id)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Marcar como Paga
                            </Button>
                          )}
                        </div>
                        <Button variant="outline" size="sm">
                          Ver Extrato
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>

                    {/* Transactions Preview */}
                    {invoice.transactions && invoice.transactions.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm font-medium mb-2">
                          {invoice.transactions.length} transação(ões) nesta fatura
                        </p>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {invoice.transactions.slice(0, 5).map((tx: any) => (
                            <div
                              key={tx.id}
                              className="flex items-center justify-between text-sm bg-muted/50 p-2 rounded"
                            >
                              <div>
                                <p className="font-medium">{tx.description}</p>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(tx.date), 'dd/MM/yyyy')}
                                  {tx.installmentNumber && tx.totalInstallments && (
                                    <span className="ml-2">
                                      {tx.installmentNumber}/{tx.totalInstallments}
                                    </span>
                                  )}
                                </p>
                              </div>
                              <p className="font-bold text-red-600">
                                {formatCurrency(tx.amount)}
                              </p>
                            </div>
                          ))}
                          {invoice.transactions.length > 5 && (
                            <p className="text-xs text-muted-foreground text-center pt-2">
                              + {invoice.transactions.length - 5} transações
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhuma fatura encontrada</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedAccountId
                    ? 'Este cartão ainda não possui faturas'
                    : 'Selecione um cartão para ver as faturas'}
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
