import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { useCreateCategory, useCategories } from '@/hooks'
import { CategoryType } from '@/types'
import toast from 'react-hot-toast'

const categorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: z.nativeEnum(CategoryType),
  icon: z.string().optional(),
  parentId: z.string().optional(),
})

type CategoryFormData = z.infer<typeof categorySchema>

interface CategoryFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export function CategoryForm({ onSuccess, onCancel }: CategoryFormProps) {
  const { mutate: createCategory, isPending } = useCreateCategory()
  const { data: categories } = useCategories()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      type: CategoryType.EXPENSE,
    },
  })

  const categoryType = watch('type')

  // Filter parent categories by type
  const parentCategories = categories?.filter(
    (cat) => cat.type === categoryType && !cat.parentId
  )

  const onSubmit = (data: CategoryFormData) => {
    const payload: any = {
      name: data.name,
      type: data.type as CategoryType,
      parentId: data.parentId || undefined,
    }

    if (data.icon) {
      payload.icon = data.icon
    }

    createCategory(payload, {
      onSuccess: () => {
        toast.success('Categoria criada com sucesso!')
        onSuccess()
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao criar categoria')
      },
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name" required>
          Nome da Categoria
        </Label>
        <Input
          id="name"
          placeholder="Ex: Alimentação, Salário, etc"
          {...register('name')}
          error={errors.name?.message}
        />
      </div>

      <div>
        <Label htmlFor="type" required>
          Tipo
        </Label>
        <Select id="type" {...register('type')} error={errors.type?.message}>
          <option value={CategoryType.EXPENSE}>Despesa</option>
          <option value={CategoryType.INCOME}>Receita</option>
        </Select>
      </div>

      <div>
        <Label htmlFor="icon">Ícone</Label>
        <Input
          id="icon"
          placeholder="Ex: 🍔, 💰, 🏠, 🚗"
          {...register('icon')}
          error={errors.icon?.message}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Use um emoji para representar a categoria
        </p>
      </div>

      <div>
        <Label htmlFor="parentId">Categoria Pai (opcional)</Label>
        <Select id="parentId" {...register('parentId')}>
          <option value="">Nenhuma (categoria raiz)</option>
          {parentCategories?.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </Select>
        <p className="text-xs text-muted-foreground mt-1">
          Crie subcategorias selecionando uma categoria pai
        </p>
      </div>

      <div className="flex gap-2 justify-end pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isPending}>
          Criar Categoria
        </Button>
      </div>
    </form>
  )
}
