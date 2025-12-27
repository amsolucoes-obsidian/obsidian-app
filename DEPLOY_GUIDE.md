# 🚀 Guia Completo de Deploy - OBSIDIAN Next.js

Este guia te levará passo-a-passo desde a configuração do Supabase até o deploy na Vercel e integração com Hotmart.

---

## 📋 Pré-requisitos

- Conta no [Supabase](https://supabase.com) (gratuita)
- Conta na [Vercel](https://vercel.com) (gratuita)
- Conta na [Hotmart](https://hotmart.com) com produto configurado
- Domínio customizado (opcional, mas recomendado)

---

## 1️⃣ Configurar Supabase

### 1.1 Criar Projeto

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "New Project"
3. Preencha:
   - **Name**: obsidian-prod
   - **Database Password**: (anote essa senha!)
   - **Region**: escolha a mais próxima do Brasil (ex: South America)
4. Clique em "Create new project"
5. Aguarde 2-3 minutos até o projeto estar pronto

### 1.2 Executar Schema SQL

1. No painel do Supabase, vá em **SQL Editor** (menu lateral)
2. Clique em "New query"
3. Copie TODO o conteúdo do arquivo `supabase/schema.sql` deste projeto
4. Cole no editor SQL
5. Clique em "Run" (ou pressione Ctrl+Enter)
6. Aguarde a execução (deve aparecer "Success")

### 1.3 Configurar Autenticação

1. Vá em **Authentication** > **Providers** (menu lateral)
2. Em "Email", certifique-se que está **habilitado**
3. Configure:
   - **Enable Email provider**: ✅ ON
   - **Confirm email**: ✅ ON (recomendado)
   - **Secure email change**: ✅ ON
4. Em **URL Configuration**:
   - **Site URL**: `https://app.seudominio.com.br` (ou seu domínio)
   - **Redirect URLs**: adicione:
     - `https://app.seudominio.com.br/**`
     - `http://localhost:3000/**` (para desenvolvimento)

### 1.4 Obter Credenciais

1. Vá em **Settings** > **API** (menu lateral)
2. Anote as seguintes informações:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` ⚠️ **NUNCA exponha essa chave!**

---

## 2️⃣ Deploy na Vercel

### 2.1 Preparar Projeto

1. Crie um repositório no GitHub com o código do projeto
2. Faça push de todos os arquivos:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - OBSIDIAN Next.js"
   git branch -M main
   git remote add origin https://github.com/seu-usuario/obsidian-nextjs.git
   git push -u origin main
   ```

### 2.2 Importar no Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Clique em "Add New..." > "Project"
3. Selecione seu repositório GitHub
4. Configure:
   - **Framework Preset**: Next.js (detectado automaticamente)
   - **Root Directory**: `./` (raiz)
   - **Build Command**: `next build` (padrão)
   - **Output Directory**: `.next` (padrão)

### 2.3 Configurar Variáveis de Ambiente

Na seção "Environment Variables", adicione:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Hotmart
HOTMART_WEBHOOK_SECRET=seu-token-secreto-aqui
NEXT_PUBLIC_HOTMART_CHECKOUT_URL=https://pay.hotmart.com/seu-produto-id

# App
NEXT_PUBLIC_APP_URL=https://seu-dominio.vercel.app
NODE_ENV=production
```

⚠️ **Importante**: Use valores diferentes para cada ambiente (Production, Preview, Development)

### 2.4 Deploy

1. Clique em "Deploy"
2. Aguarde 2-3 minutos
3. Acesse a URL gerada (ex: `obsidian-nextjs.vercel.app`)

---

## 3️⃣ Configurar Domínio Customizado

### 3.1 Adicionar Domínio na Vercel

1. No projeto da Vercel, vá em **Settings** > **Domains**
2. Clique em "Add"
3. Digite seu domínio: `app.seudominio.com.br`
4. A Vercel mostrará os registros DNS necessários

### 3.2 Configurar DNS

No seu provedor de domínio (Registro.br, GoDaddy, etc.):

1. Adicione um registro **CNAME**:
   - **Name**: `app`
   - **Value**: `cname.vercel-dns.com`
   - **TTL**: 3600

2. Aguarde propagação (pode levar até 48h, mas geralmente 10-30 minutos)

3. Volte na Vercel e clique em "Refresh" até aparecer "Valid Configuration"

### 3.3 Atualizar Supabase

1. Volte no Supabase > **Authentication** > **URL Configuration**
2. Atualize **Site URL** para: `https://app.seudominio.com.br`

---

## 4️⃣ Integrar Hotmart

### 4.1 Configurar Webhook

1. Acesse [Hotmart](https://app.hotmart.com)
2. Vá em **Produtos** > selecione seu produto
3. Vá em **Configurações** > **Webhooks**
4. Clique em "Adicionar webhook"
5. Configure:
   - **URL**: `https://app.seudominio.com.br/api/webhooks/hotmart`
   - **Versão**: v2 (mais recente)
   - **Eventos**: selecione TODOS os eventos relacionados a compra e assinatura:
     - ✅ PURCHASE_APPROVED
     - ✅ PURCHASE_COMPLETE
     - ✅ PURCHASE_CANCELED
     - ✅ PURCHASE_CHARGEBACK
     - ✅ PURCHASE_REFUNDED
     - ✅ PURCHASE_DELAYED
     - ✅ SUBSCRIPTION_CANCELLATION
     - ✅ SUBSCRIPTION_RENEWAL
6. Clique em "Salvar"

### 4.2 Configurar Token de Segurança

1. Na mesma tela de webhooks, copie o **Token de Segurança** (Hottok)
2. Volte na Vercel > **Settings** > **Environment Variables**
3. Edite `HOTMART_WEBHOOK_SECRET` e cole o token
4. Clique em "Save"
5. Faça um novo deploy para aplicar (Vercel > **Deployments** > **Redeploy**)

### 4.3 Testar Webhook

1. Na Hotmart, clique em "Testar webhook"
2. Selecione evento "PURCHASE_APPROVED"
3. Clique em "Enviar teste"
4. Verifique no Supabase se o evento foi registrado:
   - Vá em **Table Editor** > `hotmart_events`
   - Deve aparecer um registro com o evento de teste

---

## 5️⃣ Configurar PWA

### 5.1 Gerar Ícones

Você precisa criar ícones PNG nas seguintes dimensões:
- 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

**Ferramentas recomendadas:**
- [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator)
- [Favicon.io](https://favicon.io/)
- [RealFaviconGenerator](https://realfavicongenerator.net/)

**Processo:**
1. Crie uma imagem quadrada 512x512px com o logo OBSIDIAN
2. Use uma das ferramentas acima para gerar todos os tamanhos
3. Baixe os arquivos e coloque na pasta `public/`
4. Nomeie como: `icon-72x72.png`, `icon-96x96.png`, etc.

### 5.2 Testar PWA

1. Acesse o app no celular: `https://app.seudominio.com.br`
2. No Chrome/Safari, deve aparecer um banner "Adicionar à tela inicial"
3. Clique e instale
4. Abra o app instalado - deve abrir em tela cheia, sem barra de navegação

---

## 6️⃣ Fluxo de Uso (Hotmart)

### Como o cliente recebe acesso:

1. **Cliente compra na Hotmart**
   - Preenche email e paga
   - Hotmart envia webhook → seu servidor recebe

2. **Cliente cria conta no OBSIDIAN**
   - Acessa `https://app.seudominio.com.br`
   - Clica em "Criar conta"
   - Usa o **mesmo email** da compra Hotmart
   - Cria senha

3. **Sistema verifica assinatura**
   - Backend busca assinatura pelo email
   - Se encontrar compra ativa → libera acesso
   - Se não encontrar → mostra tela de bloqueio

4. **Cliente usa o app**
   - Acessa todas as funcionalidades
   - Dados salvos no Supabase
   - Sincronização automática

5. **Renovação/Cancelamento**
   - Hotmart envia webhook automaticamente
   - Sistema atualiza status da assinatura
   - Se cancelar → acesso bloqueado na próxima verificação

---

## 7️⃣ Monitoramento e Logs

### Ver Logs da Vercel

1. Vá em **Deployments** > clique no deployment ativo
2. Clique em **Functions** > selecione a função
3. Veja logs em tempo real

### Ver Eventos Hotmart

1. Acesse Supabase > **Table Editor** > `hotmart_events`
2. Veja todos os webhooks recebidos
3. Coluna `processed`: indica se foi processado com sucesso
4. Coluna `error_message`: mostra erros se houver

### Ver Assinaturas

1. Acesse Supabase > **Table Editor** > `subscriptions`
2. Veja status de todos os usuários
3. Filtre por `status = 'active'` para ver assinantes ativos

---

## 8️⃣ Manutenção

### Atualizar Código

```bash
git add .
git commit -m "Descrição da mudança"
git push
```

A Vercel fará deploy automático!

### Backup do Banco

1. Supabase > **Database** > **Backups**
2. Backups diários automáticos (plano gratuito: 7 dias)
3. Para backup manual: **Database** > **Backups** > "Create backup"

### Monitorar Performance

1. Vercel > **Analytics** (aba no projeto)
2. Veja métricas de performance, erros, etc.

---

## 9️⃣ Troubleshooting

### Webhook não está funcionando

1. Verifique se a URL está correta na Hotmart
2. Teste com `curl`:
   ```bash
   curl -X POST https://app.seudominio.com.br/api/webhooks/hotmart \
     -H "x-hotmart-hottok: seu-token" \
     -H "Content-Type: application/json" \
     -d '{"event":"PURCHASE_APPROVED","data":{"buyer":{"email":"teste@teste.com"}}}'
   ```
3. Veja logs na Vercel

### Usuário não consegue acessar após comprar

1. Verifique se o email usado na Hotmart é o mesmo do cadastro
2. Veja tabela `subscriptions` no Supabase
3. Veja tabela `hotmart_events` - evento foi recebido?

### PWA não instala

1. Certifique-se que está usando HTTPS
2. Verifique se `manifest.json` está acessível: `https://app.seudominio.com.br/manifest.json`
3. Abra DevTools > Application > Manifest - veja erros

---

## 🎉 Pronto!

Seu OBSIDIAN está no ar! 

**Próximos passos:**
1. Migrar componentes do OBSIDIAN original (formulários, gráficos, etc.)
2. Testar fluxo completo (cadastro → compra → uso)
3. Configurar analytics (Google Analytics, Hotjar, etc.)
4. Adicionar mais funcionalidades

**Dúvidas?** Consulte:
- [Documentação Supabase](https://supabase.com/docs)
- [Documentação Vercel](https://vercel.com/docs)
- [Documentação Hotmart](https://developers.hotmart.com)
