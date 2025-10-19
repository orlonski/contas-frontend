import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export function LoginPage() {
  const { login, isLoggingIn, loginError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login({ email, password })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center">Contas</CardTitle>
          <CardDescription className="text-center">
            Entre com sua conta para acessar o sistema
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {loginError && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                Email ou senha inválidos
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" required>Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" required>Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" isLoading={isLoggingIn}>
              Entrar
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Não tem uma conta?{' '}
              <Link to="/register" className="text-primary hover:underline font-medium">
                Registre-se
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
