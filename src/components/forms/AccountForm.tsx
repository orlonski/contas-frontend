import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { useCreateAccount } from '@/hooks'
import { AccountType } from '@/types'
import toast from 'react-hot-toast'

const accountSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: z.nativeEnum(AccountType),
  initialBalance: z.string().min(1, 'Saldo inicial é obrigatório'),
  bank: z.string().optional(),
  creditLimit: z.string().optional(),
  dueDay: z.string().optional(),
  closingDay: z.string().optional(),
}).refine((data) => {
  // Se for cartão de crédito, os campos são obrigatórios
  if (data.type === AccountType.CREDIT_CARD) {
    return !!(data.creditLimit && data.dueDay && data.closingDay)
  }
  return true
}, {
  message: 'Cartão de crédito requer limite, dia de vencimento e dia de fechamento',
  path: ['creditLimit'],
})

type AccountFormData = z.infer<typeof accountSchema>

interface AccountFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export function AccountForm({ onSuccess, onCancel }: AccountFormProps) {
  const { mutate: createAccount, isPending } = useCreateAccount()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      type: AccountType.CHECKING,
      initialBalance: '0',
    },
  })

  const accountType = watch('type')

  const onSubmit = (data: AccountFormData) => {
    const payload = {
      name: data.name,
      type: data.type as AccountType,
      initialBalance: parseFloat(data.initialBalance),
      bank: data.bank || undefined,
      creditLimit: data.creditLimit ? parseFloat(data.creditLimit) : undefined,
      dueDay: data.dueDay ? parseInt(data.dueDay) : undefined,
      closingDay: data.closingDay ? parseInt(data.closingDay) : undefined,
    }

    createAccount(payload, {
      onSuccess: () => {
        toast.success('Conta criada com sucesso!')
        onSuccess()
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao criar conta')
      },
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name" required>
          Nome da Conta
        </Label>
        <Input
          id="name"
          placeholder="Ex: Conta Corrente Nubank"
          {...register('name')}
          error={errors.name?.message}
        />
      </div>

      <div>
        <Label htmlFor="type" required>
          Tipo de Conta
        </Label>
        <Select id="type" {...register('type')} error={errors.type?.message}>
          <option value={AccountType.CHECKING}>Conta Corrente</option>
          <option value={AccountType.SAVINGS}>Poupança</option>
          <option value={AccountType.CREDIT_CARD}>Cartão de Crédito</option>
        </Select>
      </div>

      <div>
        <Label htmlFor="bank">Banco</Label>
        <Input
          id="bank"
          placeholder="Ex: Nubank, Itaú, Bradesco"
          {...register('bank')}
        />
      </div>

      <div>
        <Label htmlFor="initialBalance" required>
          Saldo Inicial (R$)
        </Label>
        <Input
          id="initialBalance"
          type="number"
          step="0.01"
          placeholder="0.00"
          {...register('initialBalance')}
          error={errors.initialBalance?.message}
        />
      </div>

      {accountType === AccountType.CREDIT_CARD && (
        <>
          <div>
            <Label htmlFor="creditLimit" required>
              Limite de Crédito (R$)
            </Label>
            <Input
              id="creditLimit"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('creditLimit')}
              error={errors.creditLimit?.message}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="closingDay" required>
                Dia de Fechamento
              </Label>
              <Input
                id="closingDay"
                type="number"
                min="1"
                max="31"
                placeholder="Ex: 15"
                {...register('closingDay')}
                error={errors.closingDay?.message}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Dia que a fatura fecha
              </p>
            </div>

            <div>
              <Label htmlFor="dueDay" required>
                Dia de Vencimento
              </Label>
              <Input
                id="dueDay"
                type="number"
                min="1"
                max="31"
                placeholder="Ex: 25"
                {...register('dueDay')}
                error={errors.dueDay?.message}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Dia do vencimento da fatura
              </p>
            </div>
          </div>
        </>
      )}

      <div className="flex gap-2 justify-end pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isPending}>
          Criar Conta
        </Button>
      </div>
    </form>
  )
}
