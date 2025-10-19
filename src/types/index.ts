// ========== ENUMS ==========
export enum AccountType {
  CHECKING = 'CHECKING',
  SAVINGS = 'SAVINGS',
  CREDIT_CARD = 'CREDIT_CARD',
}

export enum CategoryType {
  EXPENSE = 'EXPENSE',
  INCOME = 'INCOME',
}

export enum TransactionType {
  EXPENSE = 'EXPENSE',
  INCOME = 'INCOME',
  TRANSFER = 'TRANSFER',
}

export enum RecurrenceType {
  SIMPLE = 'SIMPLE',
  INSTALLMENT = 'INSTALLMENT',
  RECURRING = 'RECURRING',
}

export enum IntervalUnit {
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  YEAR = 'YEAR',
}

export enum InvoiceStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  PAID = 'PAID',
}

// ========== ENTITIES ==========
export interface User {
  id: string
  email: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface Account {
  id: string
  userId: string
  name: string
  type: AccountType
  initialBalance: number
  isActive: boolean
  dueDay?: number | null
  closingDay?: number | null
  creditLimit?: number | null
  bank?: string | null
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  userId: string
  name: string
  type: CategoryType
  icon: string
  parentId?: string | null
  createdAt: string
  updatedAt: string
  parent?: Category | null
  children?: Category[]
}

export interface Transaction {
  id: string
  userId: string
  accountId: string
  categoryId?: string | null
  amount: number
  date: string
  description: string
  type: TransactionType
  recurrenceType: RecurrenceType
  seriesId?: string | null
  installmentNumber?: number | null
  totalInstallments?: number | null
  intervalNumber?: number | null
  intervalUnit?: IntervalUnit | null
  isIndefinite?: boolean | null
  occurrences?: number | null
  transferFromId?: string | null
  transferToId?: string | null
  invoiceId?: string | null
  createdAt: string
  updatedAt: string
  account?: Account
  category?: Category | null
  invoice?: Invoice | null
}

export interface Invoice {
  id: string
  accountId: string
  month: number
  year: number
  closingDate: string
  dueDate: string
  totalAmount: number
  status: InvoiceStatus
  createdAt: string
  updatedAt: string
  account?: Account
  transactions?: Transaction[]
  calculatedTotal?: number
}

// ========== AUTH DTOs ==========
export interface LoginDto {
  email: string
  password: string
}

export interface RegisterDto {
  email: string
  name: string
  password: string
}

export interface AuthResponse {
  access_token: string
  user: User
}

// ========== ACCOUNT DTOs ==========
export interface CreateAccountDto {
  name: string
  initialBalance: number
  type: AccountType
  isActive?: boolean
  dueDay?: number
  closingDay?: number
  creditLimit?: number
  bank?: string
}

export interface UpdateAccountDto {
  name?: string
  initialBalance?: number
  isActive?: boolean
  dueDay?: number
  closingDay?: number
  creditLimit?: number
  bank?: string
}

export interface AccountBalance {
  accountId: string
  accountName: string
  type: AccountType
  balance: number
}

// ========== CATEGORY DTOs ==========
export interface CreateCategoryDto {
  name: string
  type: CategoryType
  icon: string
  parentId?: string | null
}

export interface UpdateCategoryDto {
  name?: string
  icon?: string
  parentId?: string | null
}

export interface CategoryTree extends Category {
  children: CategoryTree[]
}

// ========== TRANSACTION DTOs ==========
export interface CreateTransactionDto {
  accountId: string
  categoryId?: string
  amount: number
  date: string
  description: string
  type: TransactionType
  recurrenceType?: RecurrenceType

  // Para parcelamento
  totalAmount?: number
  totalInstallments?: number
  creditCardId?: string

  // Para recorrência
  intervalNumber?: number
  intervalUnit?: IntervalUnit
  isIndefinite?: boolean
  occurrences?: number
  startDate?: string
  endDate?: string

  // Para transferência
  transferToId?: string
}

export interface UpdateTransactionDto {
  amount?: number
  date?: string
  description?: string
  categoryId?: string
}

export interface TransactionFilters {
  accountId?: string
  categoryId?: string
  type?: TransactionType
  startDate?: string
  endDate?: string
}

// ========== DASHBOARD DTOs ==========
export type PeriodFilter = 'currentMonth' | 'remainingMonth' | 'fullMonth'

export interface Period {
  start: string
  end: string
}

export interface PeriodResult {
  filter: PeriodFilter
  period: Period
  totalIncome: number
  totalExpense: number
  balance: number
}

export interface ConsolidatedBalance {
  total: number
  accounts: AccountBalance[]
}

export interface ExpensesByCategory {
  categoryId: string
  categoryName: string
  total: number
  count: number
  transactions?: Transaction[]
}

export interface ExpensesByCategoryResponse {
  period: Period
  categories: ExpensesByCategory[]
}

export interface CashFlowDataPoint {
  month: string
  income: number
  expense: number
  balance: number
}

export interface CashFlowResponse {
  months: number
  data: CashFlowDataPoint[]
}

export interface DashboardSummary {
  consolidatedBalance: ConsolidatedBalance
  currentMonth: PeriodResult
  remainingMonth: PeriodResult
}

// ========== INVOICE DTOs ==========
export interface InvoiceDetail extends Invoice {
  account: Account
  transactions: Transaction[]
  calculatedTotal: number
}

// ========== API RESPONSE ==========
export interface ApiError {
  message: string
  statusCode: number
  error?: string
}
