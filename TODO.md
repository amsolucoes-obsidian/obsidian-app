# OBSIDIAN - Next.js + Supabase + Hotmart - TODO

## 🎯 Objetivo
Migrar OBSIDIAN completo para Next.js + Supabase com integração Hotmart e PWA

## ✅ Concluído

### Fase 1: Estrutura Base
- [x] Criar estrutura de diretórios Next.js (App Router)
- [x] Configurar TypeScript e ESLint
- [x] Instalar dependências principais
- [x] Criar schemas SQL para Supabase
- [x] Configurar variáveis de ambiente

### Fase 2: Autenticação
- [x] Implementar login email/senha
- [x] Implementar cadastro
- [x] Implementar reset de senha
- [x] Criar middleware de proteção de rotas
- [x] Criar tela de boas-vindas

### Fase 3: Sistema de Assinatura
- [x] Criar tabela subscriptions
- [x] Implementar verificação de assinatura ativa
- [x] Criar tela de bloqueio
- [x] Implementar webhook Hotmart
- [x] Criar tabela hotmart_events (log)

### Fase 4: PWA
- [x] Criar manifest.json
- [x] Configurar meta tags PWA
- [x] Documentar geração de ícones

### Fase 5: Documentação
- [x] Criar DEPLOY_GUIDE.md completo
- [x] Criar README.md
- [x] Documentar fluxo de assinatura
- [x] Documentar segurança e RLS

## ⏳ Próximas Fases (A Fazer)

### Fase 6: Migração de Componentes OBSIDIAN
- [ ] Migrar WelcomeScreen
- [ ] Migrar ModuleSelector
- [ ] Migrar FluxoCaixaForm
- [ ] Migrar BalancoPatrimonialForm
- [ ] Migrar Dashboard
- [ ] Migrar ConsolidatedReport
- [ ] Migrar SessionHistory
- [ ] Migrar CategorySettings

### Fase 7: Funcionalidades Avançadas
- [ ] Migrar gráficos (Recharts)
- [ ] Implementar exportação PDF
- [ ] Implementar exportação Excel
- [ ] Configurar sincronização Supabase Realtime
- [ ] Implementar modo offline completo (service worker)

### Fase 8: Testes e Deploy
- [ ] Testar fluxo completo (cadastro → compra → uso)
- [ ] Testar webhook Hotmart
- [ ] Testar instalação PWA mobile
- [ ] Deploy final na Vercel
- [ ] Configurar domínio customizado

## 📝 Notas
- Manter design preto/laranja do OBSIDIAN original
- Todas as funcionalidades devem ser migradas
- Sistema deve funcionar offline (PWA)
- Sincronização automática com Supabase
