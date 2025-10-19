import { useState, useMemo } from 'react'
import { useDashboardSummary, useExpensesByCategory, usePeriodTransactions } from '@/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Wallet, TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react'
import { format, startOfMonth, endOfMonth, parseISO, eachDayOfInterval } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { TransactionType } from '@/types'
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

type PeriodFilter = 'month-complete' | 'month-to-today' | 'tomorrow-to-end'

export function DashboardPage() {
  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState(format(currentDate, 'yyyy-MM'))
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('month-complete')

  // Parse month/year
  const [year, month] = selectedMonth.split('-').map(Number)
  const monthDate = new Date(year, month - 1)

  // Calculate date range based on filter
  const { startDate, endDate } = useMemo(() => {
    const start = startOfMonth(monthDate)
    const end = endOfMonth(monthDate)
    const today = new Date()

    switch (periodFilter) {
      case 'month-to-today':
        return {
          startDate: format(start, 'yyyy-MM-dd'),
          endDate: format(today, 'yyyy-MM-dd'),
        }
      case 'tomorrow-to-end':
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        return {
          startDate: format(tomorrow, 'yyyy-MM-dd'),
          endDate: format(end, 'yyyy-MM-dd'),
        }
      case 'month-complete':
      default:
        return {
          startDate: format(start, 'yyyy-MM-dd'),
          endDate: format(end, 'yyyy-MM-dd'),
        }
    }
  }, [monthDate, periodFilter])

  const { data: summary, isLoading: loadingSummary } = useDashboardSummary()
  const { data: transactions, isLoading: loadingTransactions } = usePeriodTransactions(startDate, endDate)
  const { data: expensesByCategoryData, isLoading: loadingExpenses } = useExpensesByCategory(
    startDate,
    endDate
  )

  // Calculate period totals from transactions
  const periodTotals = useMemo(() => {
    if (!transactions) return { income: 0, expense: 0, balance: 0 }

    const income = transactions
      .filter((t) => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0)

    const expense = transactions
      .filter((t) => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    return {
      income,
      expense,
      balance: income - expense,
    }
  }, [transactions])

  // Prepare daily cash flow chart data
  const cashFlowChartData = useMemo(() => {
    if (!transactions || transactions.length === 0) return []

    const start = parseISO(startDate)
    const end = parseISO(endDate)
    const days = eachDayOfInterval({ start, end })

    return days.map((day) => {
      const dayStr = format(day, 'yyyy-MM-dd')
      const dayTransactions = transactions.filter((t) => {
        const txDate = format(parseISO(t.date), 'yyyy-MM-dd')
        return txDate === dayStr
      })

      const income = dayTransactions
        .filter((t) => t.type === TransactionType.INCOME)
        .reduce((sum, t) => sum + t.amount, 0)

      const expense = dayTransactions
        .filter((t) => t.type === TransactionType.EXPENSE)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)

      return {
        date: format(day, 'dd/MM'),
        Receitas: income,
        Despesas: expense,
        Saldo: income - expense,
      }
    })
  }, [transactions, startDate, endDate])

  // Prepare expenses by category chart data
  const COLORS = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  ]

  const expensesPieData = expensesByCategoryData?.categories?.map((item, index) => ({
    name: item.categoryName || 'Sem categoria',
    value: Math.abs(item.total),
    color: COLORS[index % COLORS.length],
  })) || []

  const isLoading = loadingSummary || loadingTransactions || loadingExpenses

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
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral das suas finanças</p>
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

          {/* Period Filter */}
          <div className="w-56">
            <Label htmlFor="period-filter">Período</Label>
            <Select
              id="period-filter"
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value as PeriodFilter)}
            >
              <option value="month-complete">Mês Completo</option>
              <option value="month-to-today">Início até Hoje</option>
              <option value="tomorrow-to-end">Amanhã até Fim do Mês</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Period Info */}
      <Card className="bg-muted/50">
        <CardContent className="flex items-center gap-2 pt-4">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            Período selecionado: {format(new Date(startDate), 'dd/MM/yyyy')} até{' '}
            {format(new Date(endDate), 'dd/MM/yyyy')}
          </span>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary?.consolidatedBalance.total || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary?.consolidatedBalance.accounts.length || 0} conta(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(periodTotals.income)}
            </div>
            <p className="text-xs text-muted-foreground">Período selecionado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(periodTotals.expense)}
            </div>
            <p className="text-xs text-muted-foreground">Período selecionado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo do Período</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                periodTotals.balance >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatCurrency(periodTotals.balance)}
            </div>
            <p className="text-xs text-muted-foreground">Receitas - Despesas</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Cash Flow Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Fluxo de Caixa Diário</CardTitle>
          </CardHeader>
          <CardContent>
            {cashFlowChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={cashFlowChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    labelStyle={{ color: '#000' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="Receitas"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={{ fill: '#22c55e' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Despesas"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ fill: '#ef4444' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Saldo"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Nenhuma transação no período
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expenses by Category Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {expensesPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expensesPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expensesPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Nenhuma despesa no período
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Accounts */}
      <Card>
        <CardHeader>
          <CardTitle>Minhas Contas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {summary?.consolidatedBalance.accounts.map((account) => (
              <div
                key={account.accountId}
                className="flex items-center justify-between border-b pb-3 last:border-0"
              >
                <div>
                  <p className="font-medium">{account.accountName}</p>
                  <p className="text-sm text-muted-foreground">{account.type}</p>
                </div>
                <div className="text-right">
                  <p
                    className={`font-bold ${
                      account.balance >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {formatCurrency(account.balance)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
