import { useState, useMemo } from 'react'
import { format, parseISO, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { usePeriodTransactions, useAccounts } from '@/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { TransactionType, Transaction } from '@/types'
import { Pencil, TrendingUp, TrendingDown, ArrowRightLeft } from 'lucide-react'
import { TransactionFormDialog } from '@/components/forms/TransactionFormDialog'

interface DailyStatement {
  date: string
  transactions: Transaction[]
  income: number
  expense: number
  transfers: number
  dailyBalance: number
  accumulatedBalance: number
}

export function StatementsPage() {
  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState(format(currentDate, 'yyyy-MM'))
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all')
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const { data: accounts } = useAccounts()

  // Parse month/year
  const [year, month] = selectedMonth.split('-').map(Number)
  const monthDate = new Date(year, month - 1)
  const startDate = format(startOfMonth(monthDate), 'yyyy-MM-dd')
  const endDate = format(endOfMonth(monthDate), 'yyyy-MM-dd')

  const { data: transactions, isLoading, refetch } = usePeriodTransactions(startDate, endDate)

  // Filter transactions by account if selected
  const filteredTransactions = useMemo(() => {
    if (!transactions) return []
    if (selectedAccountId === 'all') return transactions
    return transactions.filter((t) => t.accountId === selectedAccountId)
  }, [transactions, selectedAccountId])

  // Calculate daily statements with accumulated balance
  const dailyStatements = useMemo(() => {
    if (!filteredTransactions || filteredTransactions.length === 0) return []

    const start = parseISO(startDate)
    const end = parseISO(endDate)
    const days = eachDayOfInterval({ start, end })

    let accumulatedBalance = 0

    return days.map((day) => {
      const dayStr = format(day, 'yyyy-MM-dd')
      const dayTransactions = filteredTransactions.filter((t) => {
        const txDate = format(parseISO(t.date), 'yyyy-MM-dd')
        return txDate === dayStr
      })

      const income = dayTransactions
        .filter((t) => t.type === TransactionType.INCOME)
        .reduce((sum, t) => sum + t.amount, 0)

      const expense = dayTransactions
        .filter((t) => t.type === TransactionType.EXPENSE)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)

      const transfers = dayTransactions
        .filter((t) => t.type === TransactionType.TRANSFER)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)

      const dailyBalance = income - expense

      accumulatedBalance += dailyBalance

      return {
        date: dayStr,
        transactions: dayTransactions,
        income,
        expense,
        transfers,
        dailyBalance,
        accumulatedBalance,
      } as DailyStatement
    })
  }, [filteredTransactions, startDate, endDate])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  // Generate month options (last 12 months + next 3 months)
  const monthOptions = []
  for (let i = -12; i <= 3; i++) {
    const date = new Date()
    date.setMonth(date.getMonth() + i)
    monthOptions.push({
      value: format(date, 'yyyy-MM'),
      label: format(date, 'MMMM yyyy', { locale: ptBR }),
    })
  }

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingTransaction(null)
    refetch()
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
      {/* Header with Filters */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Extrato Diário</h1>
          <p className="text-muted-foreground">
            Visualize suas transações dia a dia com saldo acumulado
          </p>
        </div>

        <div className="flex gap-4">
          {/* Month Selector */}
          <div className="w-48">
            <Label htmlFor="month-select">Mês/Ano</Label>
            <Select
              id="month-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {monthOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          {/* Account Filter */}
          <div className="w-56">
            <Label htmlFor="account-filter">Conta</Label>
            <Select
              id="account-filter"
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
            >
              <option value="all">Todas as Contas</option>
              {accounts?.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* Daily Statements */}
      <div className="space-y-4">
        {dailyStatements.map((day) => {
          if (day.transactions.length === 0) return null

          return (
            <Card key={day.date}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {format(parseISO(day.date), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm">
                    {day.income > 0 && (
                      <div className="flex items-center gap-1 text-green-600">
                        <TrendingUp className="h-4 w-4" />
                        <span className="font-medium">{formatCurrency(day.income)}</span>
                      </div>
                    )}
                    {day.expense > 0 && (
                      <div className="flex items-center gap-1 text-red-600">
                        <TrendingDown className="h-4 w-4" />
                        <span className="font-medium">{formatCurrency(day.expense)}</span>
                      </div>
                    )}
                    {day.transfers > 0 && (
                      <div className="flex items-center gap-1 text-blue-600">
                        <ArrowRightLeft className="h-4 w-4" />
                        <span className="font-medium">{formatCurrency(day.transfers)}</span>
                      </div>
                    )}
                    <div className="ml-4 border-l pl-4">
                      <span className="text-muted-foreground">Saldo Acumulado: </span>
                      <span
                        className={`font-bold ${
                          day.accumulatedBalance >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {formatCurrency(day.accumulatedBalance)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {day.transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{transaction.description}</p>
                          {transaction.type === TransactionType.INCOME && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                              Receita
                            </span>
                          )}
                          {transaction.type === TransactionType.EXPENSE && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                              Despesa
                            </span>
                          )}
                          {transaction.type === TransactionType.TRANSFER && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                              Transferência
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {transaction.category?.name || 'Sem categoria'}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className={`text-lg font-bold ${
                            transaction.type === TransactionType.INCOME
                              ? 'text-green-600'
                              : transaction.type === TransactionType.EXPENSE
                                ? 'text-red-600'
                                : 'text-blue-600'
                          }`}
                        >
                          {transaction.type === TransactionType.INCOME ? '+' : '-'}
                          {formatCurrency(Math.abs(transaction.amount))}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTransaction(transaction)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}

        {dailyStatements.every((day) => day.transactions.length === 0) && (
          <Card>
            <CardContent className="flex items-center justify-center h-48">
              <p className="text-muted-foreground">Nenhuma transação encontrada no período</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Transaction Dialog */}
      {isFormOpen && (
        <TransactionFormDialog
          transaction={editingTransaction || undefined}
          onClose={handleCloseForm}
        />
      )}
    </div>
  )
}
