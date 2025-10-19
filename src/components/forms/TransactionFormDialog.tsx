import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Transaction, TransactionType, RecurrenceType } from '@/types'
import { useUpdateTransaction, useDeleteTransaction, useAccounts, useCategories } from '@/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const updateSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  amount: z.string().min(1, 'Valor é obrigatório'),
  date: z.string().min(1, 'Data é obrigatória'),
  categoryId: z.string().optional(),
})

type UpdateFormData = z.infer<typeof updateSchema>

interface TransactionFormDialogProps {
  transaction?: Transaction
  onClose: () => void
}

export function TransactionFormDialog({ transaction, onClose }: TransactionFormDialogProps) {
  const { data: accounts } = useAccounts()
  const { data: categories } = useCategories()
  const { mutate: updateTransaction, isPending: isUpdating } = useUpdateTransaction()
  const { mutate: deleteTransaction, isPending: isDeleting } = useDeleteTransaction()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateFormData>({
    resolver: zodResolver(updateSchema),
    defaultValues: transaction
      ? {
          description: transaction.description,
          amount: Math.abs(transaction.amount).toString(),
          date: format(new Date(transaction.date), 'yyyy-MM-dd'),
          categoryId: transaction.categoryId || '',
        }
      : undefined,
  })

  const onSubmit = (data: UpdateFormData) => {
    if (!transaction) return

    updateTransaction(
      {
        id: transaction.id,
        data: {
          description: data.description,
          amount: parseFloat(data.amount),
          date: data.date,
          categoryId: data.categoryId || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success('Transação atualizada com sucesso!')
          onClose()
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || 'Erro ao atualizar transação')
        },
      }
    )
  }

  const handleDelete = () => {
    if (!transaction) return

    if (confirm('Deseja realmente excluir esta transação?')) {
      deleteTransaction(transaction.id, {
        onSuccess: () => {
          toast.success('Transação excluída com sucesso!')
          onClose()
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || 'Erro ao excluir transação')
        },
      })
    }
  }

  const account = accounts?.find((a) => a.id === transaction?.accountId)
  const filteredCategories = categories?.filter(
    (c) => c.type === (transaction?.type === TransactionType.INCOME ? 'INCOME' : 'EXPENSE')
  )

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Editar Transação</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          {/* Transaction Info */}
          <div className="bg-muted/50 p-3 rounded-lg space-y-1">
            <p className="text-sm text-muted-foreground">Conta</p>
            <p className="font-medium">{account?.name}</p>
            <p className="text-sm text-muted-foreground mt-2">Tipo</p>
            <p className="font-medium">
              {transaction?.type === TransactionType.INCOME
                ? 'Receita'
                : transaction?.type === TransactionType.EXPENSE
                  ? 'Despesa'
                  : 'Transferência'}
            </p>
            {transaction?.recurrenceType && transaction.recurrenceType !== RecurrenceType.SIMPLE && (
              <>
                <p className="text-sm text-muted-foreground mt-2">Recorrência</p>
                <p className="font-medium">
                  {transaction.recurrenceType === RecurrenceType.INSTALLMENT
                    ? 'Parcelada'
                    : 'Recorrente'}
                </p>
              </>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Descrição *</Label>
            <Input id="description" {...register('description')} />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <Label htmlFor="amount">Valor (R$) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              {...register('amount')}
            />
            {errors.amount && <p className="text-sm text-red-600 mt-1">{errors.amount.message}</p>}
          </div>

          {/* Date */}
          <div>
            <Label htmlFor="date">Data *</Label>
            <Input id="date" type="date" {...register('date')} />
            {errors.date && <p className="text-sm text-red-600 mt-1">{errors.date.message}</p>}
          </div>

          {/* Category */}
          {transaction?.type !== TransactionType.TRANSFER && (
            <div>
              <Label htmlFor="categoryId">Categoria</Label>
              <Select id="categoryId" {...register('categoryId')}>
                <option value="">Sem categoria</option>
                {filteredCategories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting || isUpdating}
              className="flex-1"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </Button>
            <Button type="submit" disabled={isUpdating || isDeleting} className="flex-1">
              {isUpdating ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
