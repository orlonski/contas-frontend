import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { queryClient } from '@/lib/react-query'
import { useAuthStore } from '@/store/auth.store'
import { useEffect } from 'react'

// Layout
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'

// Pages
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { AccountsPage } from '@/pages/accounts/AccountsPage'
import { CategoriesPage } from '@/pages/categories/CategoriesPage'
import { TransactionsPage } from '@/pages/transactions/TransactionsPage'
import { InvoicesPage } from '@/pages/invoices/InvoicesPage'
import { StatementsPage } from '@/pages/statements/StatementsPage'

function App() {
  const hydrate = useAuthStore((state) => state.hydrate)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="accounts" element={<AccountsPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="invoices" element={<InvoicesPage />} />
            <Route path="statements" element={<StatementsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
