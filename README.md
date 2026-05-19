# Ensaio Elétrico Web — Frontend

Sistema de gestão para empresas de manutenção elétrica. Permite gerenciar clientes, ordens de serviço, relatórios técnicos e propostas comerciais, com geração de PDF e envio de e-mail.

## Funcionalidades

| Módulo | Descrição |
|--------|-----------|
| **Dashboard** | KPIs (clientes ativos, OS abertas/concluídas, receita) com gráficos de pizza e barras |
| **Clientes** | Cadastro e gestão de clientes/condomínios com busca por nome e cidade |
| **Ordens de Serviço** | Criação, edição e controle de status de OS com notificação por e-mail |
| **Relatórios** | Laudos técnicos de manutenção elétrica com checklists por painel (inspeção visual, limpeza, reaperto, verificação elétrica), fotos e assinatura digital |
| **Propostas** | Propostas comerciais com tabela de investimento, normas técnicas, assinatura digital e exportação em PDF |

## Stack

- **React 19** + **TypeScript**
- **Vite 6** (bundler e servidor de desenvolvimento)
- **TailwindCSS 4**
- **TanStack Query v5** (cache e sincronização de dados)
- **Recharts** (gráficos)
- **React Router 7**
- **Axios** (cliente HTTP com interceptors de autenticação JWT)

## Pré-requisitos

- Node.js 18+
- Backend da API rodando (ver repositório `ensaio-eletrico-api`)

## Configuração local

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento (porta 5173)
# O proxy redireciona /api → http://localhost:3001
npm run dev
```

## Build

```bash
npm run build
```

Os arquivos estáticos são gerados em `dist/`.

## Deploy no Render

### 1. Backend (Web Service)

> Configure o backend primeiro, pois o frontend precisa da URL da API.

No painel do Render, crie um **Web Service** apontando para o repositório do backend e configure:

| Campo | Valor |
|-------|-------|
| Build Command | `npm install` |
| Start Command | `node index.js` (ou o entrypoint do seu backend) |
| Environment | Node |

Adicione as variáveis de ambiente necessárias pelo backend (ex: `MONGODB_URI`, `JWT_SECRET`, `SMTP_*`).

Anote a URL gerada, ex: `https://ensaio-eletrico-api.onrender.com`.

---

### 2. Frontend (Static Site)

No painel do Render, crie um **Static Site** apontando para **este repositório** e configure:

| Campo | Valor |
|-------|-------|
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |

#### Variável de ambiente obrigatória

| Variável | Valor |
|----------|-------|
| `VITE_API_URL` | URL do backend, ex: `https://ensaio-eletrico-api.onrender.com` |

> **Importante:** O `vite.config.ts` atual usa proxy apenas para desenvolvimento local. Em produção, o cliente Axios precisa apontar para a URL real do backend. Veja a seção abaixo.

#### Ajuste do cliente HTTP para produção

Edite [src/api/client.ts](src/api/client.ts) para usar a variável de ambiente:

```ts
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api',
  headers: { 'Content-Type': 'application/json' },
})
```

#### Roteamento SPA (Redirect Rules)

Como a aplicação usa React Router, configure o redirect no Render para que todas as rotas sejam servidas pelo `index.html`. Crie o arquivo `public/_redirects`:

```
/*  /index.html  200
```

---

## Estrutura de pastas

```
src/
├── api/          # Chamadas HTTP (axios)
├── components/
│   ├── layout/   # Sidebar, Layout principal
│   └── ui/       # Componentes reutilizáveis (Button, Input, Modal, etc.)
├── hooks/        # React Query hooks por domínio
├── pages/        # Páginas (Login, Dashboard, Clientes, OS, Relatórios, Propostas)
├── types/        # Tipos TypeScript
└── utils/        # Formatadores, constantes, helpers
```
