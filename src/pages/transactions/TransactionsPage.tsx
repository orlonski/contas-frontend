import { useState } from 'react'
import { useTransactions } from '@/hooks'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { TransactionForm } from '@/components/forms/TransactionForm'
import { Plus, ArrowLeftRight, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function TransactionsPage() {
  const { data: transactions, isLoading } = useTransactions()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const getTransactionIcon = (type: string) => {
    if (type === 'INCOME') return <TrendingUp className="h-5 w-5 text-green-600" />
    if (type === 'EXPENSE') return <TrendingDown className="h-5 w-5 text-red-600" />
    return <ArrowRight className="h-5 w-5 text-blue-600" />
  }

  const getTransactionColor = (type: string) => {
    if (type === 'INCOME') return 'text-green-600'
    if (type === 'EXPENSE') return 'text-red-600'
    return 'text-blue-600'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transações</h1>
          <p className="text-muted-foreground">Visualize e gerencie todas as suas transações</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Transação
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {transactions?.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  {getTransactionIcon(transaction.type)}
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{format(new Date(transaction.date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                      {transaction.category && (
                        <>
                          <span>•</span>
                          <span>{transaction.category.name}</span>
                        </>
                      )}
                      {transaction.installmentNumber && transaction.totalInstallments && (
                        <>
                          <span>•</span>
                          <span>{transaction.installmentNumber}/{transaction.totalInstallments}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${getTransactionColor(transaction.type)}`}>
                    {transaction.type === 'EXPENSE' && '-'}
                    {transaction.type === 'INCOME' && '+'}
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {transactions?.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ArrowLeftRight className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma transação registrada</h3>
            <p className="text-sm text-muted-foreground mb-4">Comece adicionando sua primeira transação</p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeira Transação
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Transaction Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogClose onClose={() => setIsCreateModalOpen(false)} />
          <DialogHeader>
            <DialogTitle>Nova Transação</DialogTitle>
          </DialogHeader>
          <TransactionForm
            onSuccess={() => setIsCreateModalOpen(false)}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
