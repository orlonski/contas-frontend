# 🛠️ Comandos Úteis - Contas Frontend

## 🚀 Desenvolvimento

### Iniciar servidor de desenvolvimento
```bash
npm run dev
```
- Acesso: http://localhost:5173
- Hot reload automático
- Erros aparecem no browser e terminal

### Build de produção
```bash
npm run build
```
- Cria pasta `dist/` com arquivos otimizados
- Minificação automática
- Tree shaking
- Code splitting

### Preview do build
```bash
npm run preview
```
- Testa o build de produção localmente
- Acesso: http://localhost:4173

### Linter
```bash
npm run lint
```
- Verifica problemas de código
- Segue regras do ESLint configuradas

---

## 📦 Gerenciamento de Dependências

### Instalar todas as dependências
```bash
npm install
```

### Adicionar nova dependência
```bash
npm install nome-do-pacote
```

### Adicionar dependência de desenvolvimento
```bash
npm install -D nome-do-pacote
```

### Atualizar dependências
```bash
npm update
```

### Verificar dependências desatualizadas
```bash
npm outdated
```

### Remover dependência
```bash
npm uninstall nome-do-pacote
```

---

## 🧹 Limpeza

### Limpar node_modules e reinstalar
```bash
rm -rf node_modules package-lock.json
npm install
```

### Limpar cache do npm
```bash
npm cache clean --force
```

### Limpar build
```bash
rm -rf dist
```

### Limpeza completa (Windows)
```bash
rmdir /s /q node_modules dist
npm install
```

### Limpeza completa (Linux/Mac)
```bash
rm -rf node_modules dist package-lock.json
npm install
```

---

## 🔧 Troubleshooting

### Erro de módulo não encontrado
```bash
# 1. Limpar e reinstalar
rm -rf node_modules package-lock.json
npm install

# 2. Se persistir, verificar package.json
npm list nome-do-modulo
```

### Erro no Tailwind
```bash
# Verificar se está instalado
npm list tailwindcss

# Reinstalar
npm uninstall tailwindcss
npm install -D tailwindcss@3 postcss autoprefixer
```

### Erro no TypeScript
```bash
# Verificar configuração
cat tsconfig.json

# Recompilar
npx tsc --noEmit
```

### Porta já em uso
```bash
# Windows - liberar porta 5173
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Linux/Mac - liberar porta 5173
lsof -ti:5173 | xargs kill -9
```

---

## 🌐 Backend

### Verificar se backend está rodando
```bash
curl http://localhost:3000/api
```

### Testar endpoint específico
```bash
curl http://localhost:3000/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'
```

---

## 🔍 Inspeção

### Ver estrutura do projeto
```bash
tree -L 3 src/
```

### Contar linhas de código
```bash
# Total
find src -name '*.tsx' -o -name '*.ts' | xargs wc -l

# Por tipo
find src -name '*.tsx' | xargs wc -l  # Components
find src -name '*.ts' | xargs wc -l   # Logic
```

### Ver tamanho do build
```bash
du -sh dist/
du -sh dist/assets/*
```

### Analisar bundle
```bash
npm run build -- --mode analyze
```

---

## 🐛 Debug

### Debug no VSCode
Adicione ao `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src"
    }
  ]
}
```

### Debug de API calls
No navegador:
1. Abra DevTools (F12)
2. Vá em Network tab
3. Filtre por XHR
4. Inspecione requests/responses

### Debug de React Query
```bash
# Instalar DevTools
npm install -D @tanstack/react-query-devtools
```

Adicione ao App.tsx:
```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// Dentro do QueryClientProvider
<ReactQueryDevtools initialIsOpen={false} />
```

---

## 📱 Testes

### Rodar testes (quando implementado)
```bash
npm test
```

### Testes com coverage
```bash
npm test -- --coverage
```

### Testes E2E com Playwright (quando implementado)
```bash
npx playwright test
npx playwright test --ui
```

---

## 🚀 Deploy

### Vercel
```bash
# Instalar CLI
npm i -g vercel

# Deploy
vercel

# Deploy produção
vercel --prod
```

### Netlify
```bash
# Instalar CLI
npm i -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --dir=dist --prod
```

### Docker
```bash
# Build imagem
docker build -t contas-frontend .

# Rodar container
docker run -p 3000:80 contas-frontend
```

---

## 📊 Performance

### Analisar performance do build
```bash
npm run build -- --profile
```

### Lighthouse CI (performance score)
```bash
# Instalar
npm install -g @lhci/cli

# Rodar
lhci autorun
```

### Bundle analyzer
```bash
# Instalar
npm install -D rollup-plugin-visualizer

# Adicionar ao vite.config.ts e rodar build
npm run build
```

---

## 🔐 Segurança

### Verificar vulnerabilidades
```bash
npm audit
```

### Corrigir vulnerabilidades automáticas
```bash
npm audit fix
```

### Corrigir vulnerabilidades forçado (cuidado!)
```bash
npm audit fix --force
```

---

## 📝 Git

### Commits convencionais
```bash
git commit -m "feat: adiciona nova funcionalidade"
git commit -m "fix: corrige bug na autenticação"
git commit -m "docs: atualiza README"
git commit -m "style: formata código"
git commit -m "refactor: refatora componente"
git commit -m "test: adiciona testes"
git commit -m "chore: atualiza dependências"
```

### Verificar status antes de commitar
```bash
git status
git diff
npm run lint
npm run build
```

---

## 🎨 Customização

### Alterar porta de desenvolvimento
```bash
# Criar vite.config.ts com:
export default defineConfig({
  server: {
    port: 3001
  }
})
```

### Alterar URL da API
```bash
# Editar .env
VITE_API_URL=https://sua-api.com
```

### Adicionar variável de ambiente
```bash
# 1. Adicionar ao .env
VITE_NOVA_VAR=valor

# 2. Usar no código
const valor = import.meta.env.VITE_NOVA_VAR
```

---

## 📚 Documentação

### Gerar documentação de tipos
```bash
npx typedoc --out docs src/types
```

### Ver dependências instaladas
```bash
npm list --depth=0
```

### Ver informações do pacote
```bash
npm info react
npm info @tanstack/react-query
```

---

## ⚡ Quick Commands

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Preview
npm run preview

# Lint
npm run lint

# Limpar tudo
rm -rf node_modules dist && npm install

# Deploy rápido (Vercel)
vercel --prod
```

---

## 🆘 Em caso de emergência

### "Nada funciona!"
```bash
# 1. Limpar TUDO
rm -rf node_modules dist package-lock.json .cache

# 2. Reinstalar
npm install

# 3. Rebuild
npm run build

# 4. Testar
npm run dev
```

### "Build funciona mas dev não"
```bash
# Limpar cache do Vite
rm -rf node_modules/.vite
npm run dev
```

### "Dev funciona mas build não"
```bash
# Verificar variáveis de ambiente
cat .env

# Verificar importações dinâmicas
grep -r "import(" src/

# Build com mais informações
npm run build -- --debug
```

---

**💡 Dica:** Salve este arquivo nos favoritos para acesso rápido!
