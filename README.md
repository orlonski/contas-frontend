# Contas Frontend

Sistema de controle financeiro pessoal - Frontend em React + TypeScript.

## Stack Tecnológica

### Core
- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server

### Gerenciamento de Estado
- **React Query (TanStack Query)** - Estado do servidor, cache e sincronização
- **Zustand** - Estado global (autenticação, preferências)
- **React Router v6** - Roteamento

### UI e Estilização
- **Tailwind CSS** - Framework CSS utilitário
- **shadcn/ui** - Componentes acessíveis e customizáveis (a implementar)
- **Lucide React** - Ícones

### Formulários e Validação
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas

### Gráficos e Visualização
- **Recharts** - Biblioteca de gráficos

### Utilitários
- **Axios** - Cliente HTTP
- **date-fns** - Manipulação de datas
- **clsx** + **tailwind-merge** - Utilitários de className

## Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes base (Button, Input, Card, etc)
│   ├── forms/          # Componentes de formulário
│   └── layout/         # Componentes de layout
│
├── pages/              # Páginas da aplicação
│   ├── auth/           # Login, Registro, Recuperação
│   ├── dashboard/      # Dashboard principal
│   ├── accounts/       # Gestão de contas
│   ├── categories/     # Gestão de categorias
│   ├── transactions/   # Gestão de transações
│   └── invoices/       # Faturas de cartão de crédito
│
├── services/           # Camada de comunicação com API
│   ├── auth.service.ts
│   ├── accounts.service.ts
│   ├── categories.service.ts
│   ├── transactions.service.ts
│   ├── invoices.service.ts
│   └── dashboard.service.ts
│
├── hooks/              # Custom hooks do React Query
│   ├── use-auth.ts
│   ├── use-accounts.ts
│   ├── use-categories.ts
│   ├── use-transactions.ts
│   ├── use-invoices.ts
│   └── use-dashboard.ts
│
├── store/              # Estado global (Zustand)
│   └── auth.store.ts
│
├── types/              # TypeScript types e interfaces
│   └── index.ts
│
├── lib/                # Configurações e utilitários
│   ├── axios.ts        # Configuração do Axios + interceptors
│   ├── react-query.ts  # Configuração do React Query
│   └── utils.ts        # Funções utilitárias (cn, etc)
│
└── utils/              # Funções auxiliares
```

## Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env` baseado no `.env.example`:

```bash
cp .env.example .env
```

Edite o `.env` e configure a URL da API:

```env
VITE_API_URL=http://localhost:3000
```

### 3. Executar em desenvolvimento

```bash
npm run dev
```

O projeto estará disponível em [http://localhost:5173](http://localhost:5173)

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run preview` - Preview do build de produção
- `npm run lint` - Executa o linter

## Integração com Backend

Este frontend se comunica com a API NestJS. Certifique-se de que o backend esteja rodando em `http://localhost:3000`.

### Autenticação

O sistema utiliza JWT (JSON Web Tokens) para autenticação:

1. Usuário faz login via `/auth/login`
2. Backend retorna `access_token` e dados do usuário
3. Token é armazenado no `localStorage` e em estado global (Zustand)
4. Todas as requisições subsequentes incluem o token via interceptor do Axios
5. Se o token expirar (401), usuário é redirecionado para login

### Cache e Sincronização

React Query gerencia automaticamente:
- Cache de dados da API
- Revalidação automática
- Otimistic updates
- Invalidação de cache após mutations

Exemplo de invalidação em cascade:
```typescript
// Ao criar uma transação, invalida:
- ['transactions']
- ['accounts'] // Atualiza saldos
- ['invoices'] // Atualiza faturas de cartão
- ['dashboard'] // Atualiza métricas
```

## Tipos TypeScript

Todos os tipos são baseados nos modelos do backend e estão em [src/types/index.ts](src/types/index.ts).

### Principais Tipos

- **User** - Usuário autenticado
- **Account** - Conta bancária ou cartão
- **Category** - Categoria de transação (hierárquica)
- **Transaction** - Transação financeira (despesa/receita/transferência)
- **Invoice** - Fatura de cartão de crédito
- **Dashboard Types** - Tipos para métricas e gráficos

## Funcionalidades Implementadas

### Camada de Serviços ✅
- [x] Auth Service (login, registro, perfil)
- [x] Accounts Service (CRUD de contas)
- [x] Categories Service (CRUD de categorias hierárquicas)
- [x] Transactions Service (CRUD + parcelamento + recorrência)
- [x] Invoices Service (faturas de cartão)
- [x] Dashboard Service (métricas e gráficos)

### React Query Hooks ✅
- [x] useAuth, useLogin, useRegister
- [x] useAccounts, useCreateAccount, useUpdateAccount
- [x] useCategories, useCategoriesTree
- [x] useTransactions, useCreateTransaction
- [x] useInvoices, useMarkInvoiceAsPaid
- [x] useDashboard, useCashFlow, useExpensesByCategory

### Configuração ✅
- [x] Axios com interceptors JWT
- [x] React Query com configuração otimizada
- [x] Zustand store para autenticação
- [x] Tailwind CSS configurado
- [x] Path alias (@/) configurado

## Próximos Passos

### Componentes UI (shadcn/ui)
- [ ] Button
- [ ] Input
- [ ] Card
- [ ] Dialog/Modal
- [ ] Select
- [ ] DatePicker
- [ ] Form components

### Páginas
- [ ] Login
- [ ] Registro
- [ ] Dashboard principal
- [ ] Gestão de contas
- [ ] Gestão de categorias
- [ ] Nova transação (formulário complexo)
- [ ] Listagem de transações
- [ ] Visualização de faturas

### Layout
- [ ] Sidebar de navegação
- [ ] Header com perfil do usuário
- [ ] Rotas protegidas
- [ ] Loading states
- [ ] Error boundaries

## Convenções de Código

### Nomenclatura
- **Componentes**: PascalCase (`TransactionForm.tsx`)
- **Hooks**: camelCase com prefixo `use` (`useTransactions.ts`)
- **Services**: camelCase com sufixo `.service` (`auth.service.ts`)
- **Types**: PascalCase para interfaces/types

### Organização de Imports
```typescript
// 1. Bibliotecas externas
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

// 2. Imports internos (com alias @/)
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks'
import { Transaction } from '@/types'

// 3. Imports relativos (evitar quando possível)
import { helper } from './utils'
```

### Componentes
```typescript
// Sempre tipar props
interface ButtonProps {
  variant?: 'primary' | 'secondary'
  children: React.ReactNode
  onClick?: () => void
}

export function Button({ variant = 'primary', children, onClick }: ButtonProps) {
  return (
    <button onClick={onClick} className={cn(/* ... */)}>
      {children}
    </button>
  )
}
```

## Dicas de Desenvolvimento

### Uso de Hooks do React Query

```typescript
// ✅ Bom - usar hooks customizados
const { data: accounts, isLoading } = useAccounts()

// ❌ Evitar - chamar service diretamente
const accounts = await accountsService.getAll()
```

### Invalidação de Cache

Após mutations que afetam múltiplos recursos, invalide todos os caches relacionados:

```typescript
const { mutate } = useCreateTransaction()

// React Query automaticamente invalida:
// - transactions
// - accounts (saldos)
// - invoices (se cartão)
// - dashboard (métricas)
```

### Estado Global vs Local

- **Global (Zustand)**: Autenticação, tema, preferências do usuário
- **Server State (React Query)**: Todos os dados da API
- **Local (useState)**: Estado de UI (modals abertos, formulários, etc)

## Contribuindo

1. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
2. Commit suas mudanças (`git commit -m 'feat: adiciona nova funcionalidade'`)
3. Push para a branch (`git push origin feature/nova-funcionalidade`)
4. Abra um Pull Request

## Licença

MIT
