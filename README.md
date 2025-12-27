# 🔮 OBSIDIAN - Seu Espelho Financeiro

**PWA de controle financeiro com Next.js + Supabase + Hotmart**

Transforme o caos dos seus gastos em clareza cristalina. Controle total de suas finanças em um único lugar.

---

## 🚀 Stack Tecnológica

- **Frontend**: Next.js 14 + React 18 + TypeScript
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL + RLS)
- **Auth**: Supabase Auth (email/senha)
- **Payments**: Hotmart (webhooks)
- **Deploy**: Vercel
- **PWA**: Instalável (manifest + service worker)

---

## ✨ Funcionalidades

### Autenticação
- ✅ Login com email/senha
- ✅ Cadastro de usuário
- ✅ Reset de senha por email
- ✅ Proteção de rotas (middleware)

### Sistema de Assinatura
- ✅ Controle de assinatura anual via Hotmart
- ✅ Webhook automático (ativa/desativa conforme pagamento)
- ✅ Tela de bloqueio quando assinatura expira
- ✅ Verificação em tempo real

### Segurança
- ✅ Row Level Security (RLS) no Supabase
- ✅ Dados isolados por usuário
- ✅ Validação de webhooks Hotmart
- ✅ Service role key protegida

### PWA
- ✅ Instalável (adicionar à tela inicial)
- ✅ Funciona offline
- ✅ Ícones e manifest configurados
- ✅ Experiência nativa no mobile

---

## 📁 Estrutura do Projeto

```
obsidian-nextjs/
├── app/                      # Next.js App Router
│   ├── page.tsx             # Página inicial (boas-vindas)
│   ├── login/               # Página de login
│   ├── cadastro/            # Página de cadastro
│   ├── esqueci-senha/       # Reset de senha
│   ├── app/                 # App principal (protegido)
│   ├── api/
│   │   └── webhooks/
│   │       └── hotmart/     # Webhook Hotmart
│   ├── layout.tsx           # Layout root
│   └── globals.css          # Estilos globais
├── components/              # Componentes React
│   └── SubscriptionBlockedScreen.tsx
├── lib/                     # Utilitários
│   ├── supabase.ts         # Cliente Supabase
│   └── subscription.ts      # Lógica de assinatura
├── public/                  # Assets estáticos
│   ├── manifest.json        # PWA manifest
│   └── icon-*.png           # Ícones PWA
├── supabase/
│   └── schema.sql           # Schema do banco
├── middleware.ts            # Proteção de rotas
├── next.config.js           # Config Next.js
├── tailwind.config.js       # Config Tailwind
├── package.json             # Dependências
├── DEPLOY_GUIDE.md          # 📚 Guia completo de deploy
└── README.md                # Este arquivo
```

---

## 🛠️ Desenvolvimento Local

### Pré-requisitos

- Node.js 18+
- pnpm (recomendado) ou npm
- Conta no Supabase (gratuita)

### Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/obsidian-nextjs.git
   cd obsidian-nextjs
   ```

2. **Instale dependências**
   ```bash
   pnpm install
   # ou
   npm install
   ```

3. **Configure variáveis de ambiente**
   ```bash
   cp .env.example .env.local
   ```
   
   Edite `.env.local` com suas credenciais do Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   HOTMART_WEBHOOK_SECRET=seu-token-secreto
   NEXT_PUBLIC_HOTMART_CHECKOUT_URL=https://pay.hotmart.com/seu-produto
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Configure banco de dados**
   - Acesse seu projeto no Supabase
   - Vá em SQL Editor
   - Execute o conteúdo de `supabase/schema.sql`

5. **Inicie o servidor de desenvolvimento**
   ```bash
   pnpm dev
   # ou
   npm run dev
   ```

6. **Acesse o app**
   - Abra [http://localhost:3000](http://localhost:3000)

---

## 📦 Deploy em Produção

**Siga o guia completo:** [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md)

**Resumo:**
1. Configure Supabase (banco + auth)
2. Faça deploy na Vercel
3. Configure domínio customizado
4. Integre webhook Hotmart
5. Teste fluxo completo

---

## 🔐 Segurança

### Row Level Security (RLS)

Todas as tabelas têm RLS habilitado. Usuários só podem:
- Ler/escrever seus próprios dados
- Não acessar dados de outros usuários

### Validação de Webhooks

Webhooks Hotmart são validados via token secreto (`x-hotmart-hottok`).

### Variáveis Sensíveis

- `SUPABASE_SERVICE_ROLE_KEY`: **NUNCA** exponha no frontend
- `HOTMART_WEBHOOK_SECRET`: Apenas no backend
- Use variáveis de ambiente diferentes por ambiente (dev/prod)

---

## 📊 Banco de Dados

### Tabelas Principais

- **subscriptions**: Assinaturas dos usuários
- **hotmart_events**: Log de webhooks Hotmart
- **financial_sessions**: Análises financeiras (Fluxo de Caixa + Balanço)
- **user_settings**: Configurações personalizadas

### Funções Helper

- `is_subscription_active(user_id)`: Verifica se assinatura está ativa
- `create_initial_subscription()`: Cria assinatura ao cadastrar usuário

---

## 🔄 Fluxo de Assinatura

1. **Cliente compra na Hotmart**
   - Hotmart envia webhook `PURCHASE_APPROVED`
   - Sistema cria/atualiza assinatura com `status=active`

2. **Cliente cria conta**
   - Usa o mesmo email da compra
   - Sistema busca assinatura pelo email

3. **Verificação de acesso**
   - Ao entrar no app, verifica:
     - `status = 'active'`
     - `expires_at >= hoje`
   - Se OK → libera acesso
   - Se não → mostra tela de bloqueio

4. **Cancelamento/Expiração**
   - Hotmart envia webhook `PURCHASE_CANCELED` ou `SUBSCRIPTION_CANCELLATION`
   - Sistema atualiza `status=inactive`
   - Usuário é bloqueado na próxima verificação

---

## 🎨 Customização

### Cores

Edite `tailwind.config.js`:
```js
colors: {
  primary: '#ff6b35',  // Laranja OBSIDIAN
  secondary: '#1a1a1a', // Preto/cinza
}
```

### Textos

- Boas-vindas: `app/page.tsx`
- Tela de bloqueio: `components/SubscriptionBlockedScreen.tsx`

### PWA

- Manifest: `public/manifest.json`
- Ícones: `public/icon-*.png`

---

## 🧪 Testes

### Testar Webhook Localmente

Use [ngrok](https://ngrok.com) para expor localhost:

```bash
ngrok http 3000
```

Configure URL do webhook na Hotmart:
```
https://xxxx.ngrok.io/api/webhooks/hotmart
```

### Testar Assinatura

1. Crie usuário manualmente no Supabase
2. Insira registro na tabela `subscriptions`:
   ```sql
   INSERT INTO subscriptions (user_id, status, plan, expires_at)
   VALUES ('uuid-do-usuario', 'active', 'annual', NOW() + INTERVAL '1 year');
   ```
3. Faça login e teste acesso

---

## 📝 TODO

- [ ] Migrar componentes do OBSIDIAN original
  - [ ] FluxoCaixaForm
  - [ ] BalancoPatrimonialForm
  - [ ] ConsolidatedReport
  - [ ] SessionHistory
  - [ ] CategorySettings
- [ ] Implementar gráficos (Recharts)
- [ ] Implementar exportação PDF/Excel
- [ ] Adicionar testes (Jest + React Testing Library)
- [ ] Configurar CI/CD
- [ ] Adicionar analytics (Google Analytics, Plausible, etc.)

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto é privado e proprietário.

---

## 📞 Suporte

- **Documentação**: [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md)
- **Issues**: [GitHub Issues](https://github.com/seu-usuario/obsidian-nextjs/issues)
- **Email**: suporte@seudominio.com.br

---

## 🎉 Créditos

Desenvolvido com ❤️ usando:
- [Next.js](https://nextjs.org)
- [Supabase](https://supabase.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Vercel](https://vercel.com)
- [Hotmart](https://hotmart.com)

---

**OBSIDIAN** - Seu Espelho Financeiro 🔮
