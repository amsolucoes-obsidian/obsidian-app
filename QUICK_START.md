# 🚀 Quick Start - OBSIDIAN Next.js

**Comece em 10 minutos!**

---

## 1️⃣ Extrair Projeto

```bash
unzip obsidian-nextjs.zip
cd obsidian-nextjs
```

---

## 2️⃣ Instalar Dependências

```bash
pnpm install
# ou
npm install
```

---

## 3️⃣ Configurar Supabase

### 3.1 Criar Projeto
1. Acesse [supabase.com](https://supabase.com)
2. Clique em "New Project"
3. Preencha nome e senha
4. Aguarde 2-3 minutos

### 3.2 Executar SQL
1. Vá em **SQL Editor**
2. Cole o conteúdo de `supabase/schema.sql`
3. Clique em "Run"

### 3.3 Pegar Credenciais
1. Vá em **Settings** > **API**
2. Copie:
   - Project URL
   - anon public key
   - service_role key

---

## 4️⃣ Configurar Variáveis

Crie `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
HOTMART_WEBHOOK_SECRET=seu-token-secreto
NEXT_PUBLIC_HOTMART_CHECKOUT_URL=https://pay.hotmart.com/seu-produto
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 5️⃣ Iniciar Desenvolvimento

```bash
pnpm dev
# ou
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## 6️⃣ Testar

1. Clique em "Criar conta"
2. Cadastre-se com email/senha
3. Faça login
4. Você verá a tela "Bem-vindo ao OBSIDIAN!"

---

## 7️⃣ Deploy

**Siga o guia completo:** [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md)

**Resumo:**
1. Push para GitHub
2. Importar na Vercel
3. Configurar variáveis de ambiente
4. Deploy automático!

---

## ❓ Problemas?

### Erro ao executar SQL
- Certifique-se que copiou TODO o conteúdo de `schema.sql`
- Execute novamente (é idempotente)

### Erro de autenticação
- Verifique se as chaves do Supabase estão corretas
- Certifique-se que `.env.local` existe

### Página em branco
- Abra DevTools (F12) e veja erros no console
- Verifique se o servidor está rodando

---

## 📚 Documentação Completa

- **README.md**: Visão geral do projeto
- **DEPLOY_GUIDE.md**: Guia completo de deploy
- **TODO.md**: Roadmap de desenvolvimento

---

## 🎉 Pronto!

Agora você pode:
- Desenvolver localmente
- Fazer deploy na Vercel
- Integrar com Hotmart
- Migrar componentes do OBSIDIAN original

**Boa sorte!** 🚀
