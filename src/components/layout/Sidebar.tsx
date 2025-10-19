import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Wallet,
  FolderTree,
  ArrowLeftRight,
  CreditCard,
  FileText,
  LogOut
} from 'lucide-react'
import { useAuth } from '@/hooks'
import { cn } from '@/lib/utils'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Wallet, label: 'Contas', path: '/accounts' },
  { icon: FolderTree, label: 'Categorias', path: '/categories' },
  { icon: ArrowLeftRight, label: 'Transações', path: '/transactions' },
  { icon: CreditCard, label: 'Faturas', path: '/invoices' },
  { icon: FileText, label: 'Extrato Diário', path: '/statements' },
]

export function Sidebar() {
  const location = useLocation()
  const { user, logout } = useAuth()

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-2xl font-bold text-primary">Contas</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/')

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="border-t p-4">
        <div className="mb-3 rounded-lg bg-muted p-3">
          <p className="text-sm font-medium">{user?.name}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
        >
          <LogOut className="h-5 w-5" />
          Sair
        </button>
      </div>
    </div>
  )
}
