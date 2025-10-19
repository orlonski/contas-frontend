import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { useCreateTransaction, useAccounts, useCategories } from '@/hooks'
import { TransactionType, RecurrenceType, IntervalUnit, AccountType } from '@/types'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const transactionSchema = z.object({
  type: z.nativeEnum(TransactionType),
  amount: z.string().min(1, 'Valor é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  date: z.string().min(1, 'Data é obrigatória'),
  accountId: z.string().min(1, 'Conta é obrigatória'),
  categoryId: z.string().optional(),
  destinationAccountId: z.string().optional(),

  // Recurrence
  recurrenceType: z.nativeEnum(RecurrenceType),

  // Installment fields
  totalInstallments: z.string().optional(),

  // Recurring fields
  intervalNumber: z.string().optional(),
  intervalUnit: z.nativeEnum(IntervalUnit).optional(),
  isIndefinite: z.boolean().optional(),
  occurrences: z.string().optional(),
}).refine((data) => {
  // Validate installment: must have totalInstallments
  if (data.recurrenceType === RecurrenceType.INSTALLMENT) {
    return !!data.totalInstallments && parseInt(data.totalInstallments) >= 2
  }
  return true
}, {
  message: 'Parcelamento requer número de parcelas (mínimo 2)',
  path: ['totalInstallments'],
}).refine((data) => {
  // Validate recurring: must have intervalNumber and intervalUnit
  if (data.recurrenceType === RecurrenceType.RECURRING) {
    return !!data.intervalNumber && !!data.intervalUnit
  }
  return true
}, {
  message: 'Recorrência requer intervalo',
  path: ['intervalNumber'],
}).refine((data) => {
  // Validate recurring: if not indefinite, must have occurrences
  if (data.recurrenceType === RecurrenceType.RECURRING && !data.isIndefinite) {
    return !!data.occurrences && parseInt(data.occurrences) >= 1
  }
  return true
}, {
  message: 'Informe o número de repetições ou marque como indefinida',
  path: ['occurrences'],
})

type TransactionFormData = z.infer<typeof transactionSchema>

interface TransactionFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export function TransactionForm({ onSuccess, onCancel }: TransactionFormProps) {
  const { mutate: createTransaction, isPending } = useCreateTransaction()
  const { data: accounts } = useAccounts(true)
  const { data: categories } = useCategories()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: TransactionType.EXPENSE,
      date: format(new Date(), 'yyyy-MM-dd'),
      recurrenceType: RecurrenceType.SIMPLE,
      isIndefinite: false,
      intervalUnit: IntervalUnit.MONTH,
    },
  })

  const transactionType = watch('type')
  const selectedAccountId = watch('accountId')
  const recurrenceType = watch('recurrenceType')
  const isIndefinite = watch('isIndefinite')

  // Filter categories by type
  const getCategoryType = (txType: TransactionType) => {
    if (txType === TransactionType.INCOME) return 'INCOME'
    if (txType === TransactionType.EXPENSE) return 'EXPENSE'
    return null
  }

  const filteredCategories = categories?.filter(
    (cat) => cat.type === getCategoryType(transactionType)
  )

  // For transfers, filter destination accounts
  const destinationAccounts = accounts?.filter(
    (acc) => acc.id !== selectedAccountId
  )

  const onSubmit = (data: TransactionFormData) => {
    // Check if selected account is a credit card
    const selectedAccount = accounts?.find((acc) => acc.id === data.accountId)
    const isCreditCard = selectedAccount?.type === AccountType.CREDIT_CARD

    // Convert date to ISO format (backend expects ISO string)
    const dateISO = new Date(data.date + 'T12:00:00').toISOString()

    const payload: any = {
      type: data.type as TransactionType,
      description: data.description,
      date: dateISO,
      accountId: data.accountId,
      categoryId: data.categoryId || undefined,
      destinationAccountId: data.destinationAccountId || undefined,
      recurrenceType: data.recurrenceType,
    }

    // Add installment data
    if (data.recurrenceType === RecurrenceType.INSTALLMENT) {
      const totalAmount = parseFloat(data.amount)
      const totalInstallments = parseInt(data.totalInstallments || '1')

      payload.totalAmount = totalAmount
      payload.totalInstallments = totalInstallments
      payload.amount = totalAmount / totalInstallments // Valor da parcela
    } else {
      // For simple or recurring, just send the amount
      payload.amount = parseFloat(data.amount)
    }

    // Add recurring data
    if (data.recurrenceType === RecurrenceType.RECURRING) {
      payload.intervalNumber = data.intervalNumber ? parseInt(data.intervalNumber) : undefined
      payload.intervalUnit = data.intervalUnit
      payload.isIndefinite = data.isIndefinite
      if (!data.isIndefinite) {
        payload.occurrences = data.occurrences ? parseInt(data.occurrences) : undefined
      }
    }

    // If it's a credit card expense, add creditCardId (for all expense types)
    // This should be AFTER amount/installment setup
    if (isCreditCard && data.type === TransactionType.EXPENSE) {
      payload.creditCardId = data.accountId
    }

    // Debug: log payload for credit card transactions
    if (isCreditCard) {
      console.log('🔵 Creating credit card transaction:', {
        isCreditCard,
        accountType: selectedAccount?.type,
        accountName: selectedAccount?.name,
        accountDetails: {
          dueDay: selectedAccount?.dueDay,
          closingDay: selectedAccount?.closingDay,
        },
        payload
      })
    }

    createTransaction(payload, {
      onSuccess: (response) => {
        console.log('✅ Transaction created successfully:', response)

        // Check if transactions have invoiceId
        if (Array.isArray(response)) {
          console.log('📦 Multiple transactions created (installments):', {
            count: response.length,
            invoiceIds: response.map(t => ({ id: t.id, invoiceId: t.invoiceId }))
          })
        } else {
          console.log('📦 Single transaction created:', {
            id: response.id,
            invoiceId: response.invoiceId
          })
        }

        toast.success('Transação criada com sucesso!')
        onSuccess()
      },
      onError: (error: any) => {
        console.error('❌ Error creating transaction:', error.response?.data)
        toast.error(error.response?.data?.message || 'Erro ao criar transação')
      },
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      {/* Transaction Type */}
      <div>
        <Label htmlFor="type" required>
          Tipo de Transação
        </Label>
        <Select id="type" {...register('type')} error={errors.type?.message}>
          <option value={TransactionType.EXPENSE}>Despesa</option>
          <option value={TransactionType.INCOME}>Receita</option>
          <option value={TransactionType.TRANSFER}>Transferência</option>
        </Select>
      </div>

      {/* Recurrence Type */}
      <div>
        <Label htmlFor="recurrenceType" required>
          Modo de Pagamento
        </Label>
        <Select
          id="recurrenceType"
          {...register('recurrenceType')}
          error={errors.recurrenceType?.message}
        >
          <option value={RecurrenceType.SIMPLE}>Única (Simples)</option>
          <option value={RecurrenceType.INSTALLMENT}>Parcelada</option>
          <option value={RecurrenceType.RECURRING}>Recorrente</option>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">
          {recurrenceType === RecurrenceType.SIMPLE && 'Transação única sem repetição'}
          {recurrenceType === RecurrenceType.INSTALLMENT && 'Dividida em várias parcelas'}
          {recurrenceType === RecurrenceType.RECURRING && 'Repetida automaticamente em intervalos'}
        </p>
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description" required>
          Descrição
        </Label>
        <Input
          id="description"
          placeholder="Ex: Compra no supermercado"
          {...register('description')}
          error={errors.description?.message}
        />
      </div>

      {/* Amount and Date */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="amount" required>
            Valor {recurrenceType === RecurrenceType.INSTALLMENT ? 'Total' : ''}(R$)
          </Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register('amount')}
            error={errors.amount?.message}
          />
          {recurrenceType === RecurrenceType.INSTALLMENT && (
            <p className="text-xs text-muted-foreground mt-1">
              Valor total que será dividido
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="date" required>
            Data {recurrenceType !== RecurrenceType.SIMPLE ? 'Inicial' : ''}
          </Label>
          <Input
            id="date"
            type="date"
            {...register('date')}
            error={errors.date?.message}
          />
        </div>
      </div>

      {/* Installment Options */}
      {recurrenceType === RecurrenceType.INSTALLMENT && (
        <div className="border border-dashed border-muted-foreground/30 rounded-lg p-4 space-y-3">
          <h4 className="font-medium text-sm">Parcelamento</h4>
          <div>
            <Label htmlFor="totalInstallments" required>
              Número de Parcelas
            </Label>
            <Input
              id="totalInstallments"
              type="number"
              min="2"
              max="120"
              placeholder="Ex: 12"
              {...register('totalInstallments')}
              error={errors.totalInstallments?.message}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Mínimo 2, máximo 120 parcelas
            </p>
          </div>
        </div>
      )}

      {/* Recurring Options */}
      {recurrenceType === RecurrenceType.RECURRING && (
        <div className="border border-dashed border-muted-foreground/30 rounded-lg p-4 space-y-3">
          <h4 className="font-medium text-sm">Recorrência</h4>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="intervalNumber" required>
                A cada
              </Label>
              <Input
                id="intervalNumber"
                type="number"
                min="1"
                placeholder="1"
                {...register('intervalNumber')}
                error={errors.intervalNumber?.message}
              />
            </div>
            <div>
              <Label htmlFor="intervalUnit" required>
                Período
              </Label>
              <Select
                id="intervalUnit"
                {...register('intervalUnit')}
                error={errors.intervalUnit?.message}
              >
                <option value={IntervalUnit.DAY}>Dia(s)</option>
                <option value={IntervalUnit.WEEK}>Semana(s)</option>
                <option value={IntervalUnit.MONTH}>Mês(es)</option>
                <option value={IntervalUnit.YEAR}>Ano(s)</option>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="isIndefinite"
              type="checkbox"
              {...register('isIndefinite')}
              className="rounded border-gray-300"
            />
            <Label htmlFor="isIndefinite" className="!mb-0 cursor-pointer">
              Repetir indefinidamente
            </Label>
          </div>

          {!isIndefinite && (
            <div>
              <Label htmlFor="occurrences" required>
                Número de Repetições
              </Label>
              <Input
                id="occurrences"
                type="number"
                min="1"
                placeholder="Ex: 12"
                {...register('occurrences')}
                error={errors.occurrences?.message}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Quantas vezes a transação se repetirá
              </p>
            </div>
          )}
        </div>
      )}

      {/* Account */}
      <div>
        <Label htmlFor="accountId" required>
          {transactionType === TransactionType.TRANSFER ? 'Conta de Origem' : 'Conta'}
        </Label>
        <Select id="accountId" {...register('accountId')} error={errors.accountId?.message}>
          <option value="">Selecione uma conta</option>
          {accounts?.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.name}
            </option>
          ))}
        </Select>
      </div>

      {/* Destination Account (Transfer only) */}
      {transactionType === TransactionType.TRANSFER && (
        <div>
          <Label htmlFor="destinationAccountId" required>
            Conta de Destino
          </Label>
          <Select
            id="destinationAccountId"
            {...register('destinationAccountId')}
            error={errors.destinationAccountId?.message}
          >
            <option value="">Selecione uma conta</option>
            {destinationAccounts?.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </Select>
        </div>
      )}

      {/* Category (not for transfers) */}
      {transactionType !== TransactionType.TRANSFER && (
        <div>
          <Label htmlFor="categoryId">Categoria</Label>
          <Select id="categoryId" {...register('categoryId')}>
            <option value="">Sem categoria</option>
            {filteredCategories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </Select>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 justify-end pt-4 sticky bottom-0 bg-white pb-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isPending}>
          Criar Transação
        </Button>
      </div>
    </form>
  )
}
