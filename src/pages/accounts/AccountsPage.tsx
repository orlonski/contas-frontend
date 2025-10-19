import { useState } from 'react'
import { useAccounts } from '@/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { AccountForm } from '@/components/forms/AccountForm'
import { Plus, CreditCard, Wallet as WalletIcon } from 'lucide-react'

export function AccountsPage() {
  const { data: accounts, isLoading } = useAccounts(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const getAccountIcon = (type: string) => {
    return type === 'CREDIT_CARD' ? <CreditCard className="h-5 w-5" /> : <WalletIcon className="h-5 w-5" />
  }

  const getAccountTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      CHECKING: 'Conta Corrente',
      SAVINGS: 'Poupança',
      CREDIT_CARD: 'Cartão de Crédito',
    }
    return types[type] || type
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
          <h1 className="text-3xl font-bold">Contas</h1>
          <p className="text-muted-foreground">Gerencie suas contas bancárias e cartões</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Conta
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accounts?.map((account) => (
          <Card key={account.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{account.name}</CardTitle>
                {getAccountIcon(account.type)}
              </div>
              <p className="text-sm text-muted-foreground">{getAccountTypeLabel(account.type)}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Saldo Inicial</p>
                  <p className="text-xl font-bold">{formatCurrency(account.initialBalance)}</p>
                </div>
                {account.type === 'CREDIT_CARD' && account.creditLimit && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground">Limite</p>
                    <p className="text-lg font-medium">{formatCurrency(account.creditLimit)}</p>
                  </div>
                )}
                {account.bank && (
                  <p className="text-sm text-muted-foreground">Banco: {account.bank}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {accounts?.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <WalletIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma conta cadastrada</h3>
            <p className="text-sm text-muted-foreground mb-4">Comece criando sua primeira conta</p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeira Conta
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Account Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogClose onClose={() => setIsCreateModalOpen(false)} />
          <DialogHeader>
            <DialogTitle>Nova Conta</DialogTitle>
          </DialogHeader>
          <AccountForm
            onSuccess={() => setIsCreateModalOpen(false)}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
