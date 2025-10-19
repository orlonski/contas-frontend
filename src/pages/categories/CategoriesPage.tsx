import { useState } from 'react'
import { useCategoriesTree } from '@/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { CategoryForm } from '@/components/forms/CategoryForm'
import { Plus, FolderTree } from 'lucide-react'

export function CategoriesPage() {
  const { data: categories, isLoading } = useCategoriesTree()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

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
          <h1 className="text-3xl font-bold">Categorias</h1>
          <p className="text-muted-foreground">Organize suas transações em categorias</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Categoria
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {categories?.map((category) => (
          <Card key={category.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>{category.icon}</span>
                {category.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {category.type === 'EXPENSE' ? 'Despesa' : 'Receita'}
              </p>
            </CardHeader>
            {category.children && category.children.length > 0 && (
              <CardContent>
                <div className="space-y-2">
                  {category.children.map((child) => (
                    <div key={child.id} className="flex items-center gap-2 text-sm pl-4 border-l-2 border-muted">
                      <span>{child.icon}</span>
                      <span>{child.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {categories?.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderTree className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma categoria cadastrada</h3>
            <p className="text-sm text-muted-foreground mb-4">Crie categorias para organizar suas transações</p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeira Categoria
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Category Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogClose onClose={() => setIsCreateModalOpen(false)} />
          <DialogHeader>
            <DialogTitle>Nova Categoria</DialogTitle>
          </DialogHeader>
          <CategoryForm
            onSuccess={() => setIsCreateModalOpen(false)}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
