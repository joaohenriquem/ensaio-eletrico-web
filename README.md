# Ensaio Elétrico Web — Frontend

Sistema de gestão para empresas de manutenção elétrica. Permite gerenciar clientes, ordens de serviço, relatórios técnicos e propostas comerciais, com geração de PDF e envio de e-mail.

## Funcionalidades

| Módulo           | Descrição                                                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Dashboard**    | KPIs (clientes ativos, OS abertas/concluídas, receita) com gráficos de pizza e barras                                                      |
| **Clientes**     | Cadastro e gestão de clientes/condomínios com busca por nome e cidade                                                                      |
| **Ordens de Serviço** | Criação, edição e controle de status de OS com notificação por e-mail                                                                |
| **Relatórios**   | Laudos técnicos com checklists por painel (inspeção visual, limpeza, reaperto, verificação elétrica), fotos e assinatura digital           |
| **Propostas**    | Propostas comerciais com tabela de investimento, normas técnicas, assinatura digital e exportação em PDF                                   |

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

# Copiar o arquivo de variáveis de ambiente
cp .env.example .env

# Iniciar servidor de desenvolvimento (porta 5173)
# O proxy redireciona /api → http://localhost:3001
npm run dev
```

Em desenvolvimento, `VITE_API_URL` pode ficar vazio — o proxy do Vite cuida do redirecionamento para `http://localhost:3001`.

## Variáveis de ambiente

| Variável       | Obrigatória em prod | Descrição                                                                            |
| -------------- | ------------------- | ------------------------------------------------------------------------------------ |
| `VITE_API_URL` | Sim                 | URL base do backend sem barra final. Ex: `https://ensaio-eletrico-api.onrender.com` |

## Build

```bash
npm run build
```

Os arquivos estáticos são gerados em `dist/`.

---

## Deploy no Render

### Passo 1 — Subir o backend (Web Service)

> Configure o backend **antes** do frontend, pois você precisará da URL gerada.

1. Acesse [render.com](https://render.com) e clique em **New → Web Service**
2. Conecte o repositório do backend (GitHub)
3. Preencha as configurações:

   | Campo             | Valor                                                           |
   | ----------------- | --------------------------------------------------------------- |
   | **Name**          | `ensaio-eletrico-api`                                           |
   | **Environment**   | `Node`                                                          |
   | **Build Command** | `npm install`                                                   |
   | **Start Command** | `node index.js` *(ajuste para o entrypoint do seu backend)*     |

4. Em **Environment Variables**, adicione:

   | Variável      | Descrição                                       |
   | ------------- | ----------------------------------------------- |
   | `MONGODB_URI` | String de conexão do MongoDB Atlas              |
   | `JWT_SECRET`  | Chave secreta para assinar os tokens JWT        |
   | `SMTP_HOST`   | Host do servidor de e-mail                     |
   | `SMTP_PORT`   | Porta SMTP (ex: `587`)                         |
   | `SMTP_USER`   | Usuário/e-mail de envio                        |
   | `SMTP_PASS`   | Senha ou app password do e-mail                |

5. Clique em **Create Web Service** e aguarde o deploy concluir
6. **Anote a URL gerada**, ex: `https://ensaio-eletrico-api.onrender.com`

---

### Passo 2 — Subir o frontend (Static Site)

1. No Render, clique em **New → Static Site**
2. Conecte **este repositório** (ensaio-eletrico-web)
3. Preencha as configurações:

   | Campo                  | Valor                          |
   | ---------------------- | ------------------------------ |
   | **Name**               | `ensaio-eletrico-web`          |
   | **Build Command**      | `npm install && npm run build` |
   | **Publish Directory**  | `dist`                         |

4. Em **Environment Variables**, adicione:

   | Variável       | Valor                                                              |
   | -------------- | ------------------------------------------------------------------ |
   | `VITE_API_URL` | URL do backend do Passo 1. Ex: `https://ensaio-eletrico-api.onrender.com` |

5. Clique em **Create Static Site** e aguarde o build

> O arquivo `public/_redirects` já está configurado no repositório para garantir que o React Router funcione corretamente — todas as rotas são redirecionadas para o `index.html`.

---

### Passo 3 — Verificar

Acesse a URL do Static Site gerada pelo Render e confirme:

- [ ] Tela de login carrega
- [ ] Login funciona (autentica com o backend)
- [ ] Dashboard exibe dados
- [ ] Navegação entre páginas não retorna 404

---

## Estrutura de pastas

```text
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
