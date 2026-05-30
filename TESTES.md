# Documentação de Testes — Ensaio Elétrico

## Visão Geral

O projeto possui dois níveis de testes:

| Nível | Ferramenta | Projeto | Comando |
|---|---|---|---|
| Unitário | Vitest | `ensaio-eletrico-api` | `npm test` |
| End-to-End (E2E) | Playwright | `ensaio-eletrico-web` | `npm run test:e2e` |

---

## 1. Testes Unitários — Backend (`ensaio-eletrico-api`)

Testam funções isoladas sem depender de banco de dados ou serviços externos.

### Como rodar

```bash
cd ensaio-eletrico-api

npm test                  # roda uma vez
npm run test:watch        # modo watch (rerun ao salvar)
npm run test:coverage     # com relatório de cobertura
```

---

### 1.1 `auth.test.ts` — Autenticação JWT e Senhas

Módulo: `src/auth.ts`

| # | Teste | Descrição | Esperado |
|---|---|---|---|
| 1 | Gera token válido | Chama `gerarToken` com payload completo | Retorna string com mais de 10 chars |
| 2 | Token é verificável | Gera e verifica o mesmo token | `id`, `username` e `perfil` batem com o payload original |
| 3 | Tokens diferentes para payloads diferentes | Gera dois tokens com IDs distintos | Os tokens são strings diferentes |
| 4 | Rejeita token inválido | Chama `verificarToken('token.invalido.aqui')` | Lança exceção |
| 5 | Hash diferente da senha original | Chama `hashSenha('minha_senha')` | Hash não é igual à senha |
| 6 | Verifica senha correta | Gera hash e verifica com a mesma senha | Retorna `true` |
| 7 | Rejeita senha incorreta | Verifica senha errada contra hash correto | Retorna `false` |
| 8 | Hashes diferentes para mesma senha | Gera dois hashes da mesma senha (salt) | Os hashes são diferentes entre si |

---

### 1.2 `helpers.test.ts` — Formatadores

Módulo: `src/helpers.ts`

#### `formatarMoeda`

| # | Teste | Entrada | Esperado |
|---|---|---|---|
| 1 | Formata valor zero | `0` | Contém `0` |
| 2 | Formata valor inteiro | `1500` | Contém `1.500` |
| 3 | Formata valor com centavos | `1234.56` | Contém `1.234` |
| 4 | Inclui símbolo de moeda | `100` | Contém `R$` |

#### `dataBr`

| # | Teste | Entrada | Esperado |
|---|---|---|---|
| 5 | Retorna vazio para null | `null` | `''` |
| 6 | Retorna vazio para undefined | `undefined` | `''` |
| 7 | Formata data ISO simples | `'2026-05-27'` | `'27/05/2026'` |
| 8 | Formata data ISO com timestamp | `'2026-01-15T10:00:00.000Z'` | `'15/01/2026'` |
| 9 | Retorna valor original se não for ISO | `'texto qualquer'` | `'texto qualquer'` |
| 10 | Formata objeto Date | `new Date('2026-03-10T00:00:00.000Z')` | Contém `2026` no formato `dd/mm/yyyy` |

---

### 1.3 `mailer.test.ts` — Token de Ação (Email)

Módulo: `src/mailer.ts` → `gerarTokenAcao`

| # | Teste | Descrição | Esperado |
|---|---|---|---|
| 1 | Gera token de 32 caracteres | `gerarTokenAcao('abc123', 'aprovar')` | `token.length === 32` |
| 2 | Tokens diferentes por ação | Compara `'aprovar'` vs `'reprovar'` para mesmo ID | Tokens diferentes |
| 3 | Tokens diferentes por ID | Compara `'id1'` vs `'id2'` para mesma ação | Tokens diferentes |
| 4 | Token determinístico | Chama duas vezes com mesmos args | Tokens iguais |
| 5 | Token apenas em hexadecimal | Verifica formato | Regex `/^[0-9a-f]+$/` |

---

### 1.4 `constants.test.ts` — Estado Inicial dos Painéis

Módulo: `src/helpers.ts` → `painelVazio` | `src/constants.ts`

| # | Teste | Descrição | Esperado |
|---|---|---|---|
| 1 | Nome padrão | `painelVazio()` sem args | `nome === 'Novo Painel'` |
| 2 | Nome customizado | `painelVazio('Painel Principal')` | `nome === 'Painel Principal'` |
| 3 | Inspeção visual conforme | Todos os itens de `ITENS_INSPECAO_VISUAL` | Valor `'conforme'` |
| 4 | Limpeza técnica conforme | Todos os itens de `ITENS_LIMPEZA` | Valor `'conforme'` |
| 5 | Reaperto mecânico conforme | Todos os itens de `ITENS_REAPERTO` | Valor `'conforme'` |
| 6 | Tensão padrão | `verificacao_eletrica.medicao_tensao` | `'220V'` |
| 7 | Equilíbrio de fases | `verificacao_eletrica.equilibrio_fases` | `'conforme'` |
| 8 | Tipo padrão | `tipo` | `'Térreo'` |
| 9 | Não conformidades vazias | `nao_conformidades` | `''` |

---

## 2. Testes E2E — Frontend (`ensaio-eletrico-web`)

Testam fluxos completos no navegador, simulando o comportamento real do usuário.

### Como rodar

```bash
cd ensaio-eletrico-web

# Variáveis necessárias
TEST_TOKEN=<jwt_valido>
TEST_USER_JSON='{"id":"...","username":"admin","nome":"Admin","perfil":"Administrador"}'

npm run test:e2e           # roda todos os testes
npm run test:e2e:ui        # interface visual interativa
npm run test:e2e:report    # abre relatório HTML do último run
```

### Configuração (`playwright.config.ts`)

| Parâmetro | Valor |
|---|---|
| Base URL | `http://localhost:5173` (ou `BASE_URL` env) |
| Browsers | Chromium (desktop) + Pixel 7 (mobile) |
| Retries | 1 |
| Workers | 1 (serial) |
| Screenshot | Apenas em falha |
| Vídeo | Mantém em falha |

### Autenticação nos testes

Como o sistema usa OTP por e-mail, os testes que precisam de sessão autenticada injetam o token direto no `localStorage` via `loginViaStorage()`, evitando o fluxo de OTP.

---

### 2.1 `01-login.spec.ts` — Autenticação

| # | Teste | Ação | Esperado |
|---|---|---|---|
| 1 | Exibe tela de login | Navega para `/login` | Campos de usuário, senha e botão visíveis |
| 2 | Erro com credenciais inválidas | Preenche usuário/senha errados e clica Continuar | Mensagem de erro visível |
| 3 | Redireciona sem autenticação | Navega para `/` sem token | URL contém `/login` |
| 4 | Redireciona ao acessar clientes | Navega para `/clientes` sem token | URL contém `/login` |
| 5 | Mostra passo de OTP | Credenciais válidas e clica Continuar | Texto sobre "código" visível |
| 6 | Aviso de sistema offline | Acessa `/login` fora do horário (22h30–8h30) | Banner de aviso visível |

---

### 2.2 `02-clientes.spec.ts` — Gestão de Clientes

| # | Teste | Ação | Esperado |
|---|---|---|---|
| 1 | Exibe lista de clientes | Navega para `/clientes` | Título e campo de busca visíveis |
| 2 | FAB de novo cliente | Verifica presença do botão `+` | Botão visível |
| 3 | Abre drawer ao clicar no FAB | Clica no FAB | Drawer "Novo Cliente" e campo de nome visíveis |
| 4 | Valida campos obrigatórios | Tenta salvar sem preencher | Mensagem de erro "obrigatório" visível |
| 5 | Cria novo cliente com sucesso | Preenche nome e cidade e salva | Card do cliente aparece na lista |
| 6 | Busca filtra a lista | Digita texto inexistente na busca | Mensagem "nenhum cliente encontrado" |
| 7 | Link de WhatsApp no telefone | Verifica href dos links de telefone | Href contém `wa.me/55` |

---

### 2.3 `03-ordens.spec.ts` — Ordens de Serviço

| # | Teste | Ação | Esperado |
|---|---|---|---|
| 1 | Exibe página de OS | Navega para `/ordens` | Título "Ordens de Serviço" visível |
| 2 | FAB de nova OS | Verifica presença do botão `+` | Botão visível |
| 3 | Abre drawer de nova OS | Clica no FAB | Drawer "Nova OS" e campo de descrição visíveis |
| 4 | Valida campos obrigatórios | Clica em "Criar OS" sem preencher | Mensagem de erro visível |
| 5 | Filtro de status | Seleciona status "concluída" | Cards exibem badge correspondente |
| 6 | Busca por cliente | Digita texto inexistente | Mensagem "nenhuma OS encontrada" |

---

### 2.4 `04-propostas.spec.ts` — Propostas Comerciais

| # | Teste | Ação | Esperado |
|---|---|---|---|
| 1 | Exibe página de propostas | Navega para `/propostas` | Título visível |
| 2 | FAB de nova proposta | Verifica presença do botão `+` | Botão visível |
| 3 | Abre drawer de nova proposta | Clica no FAB | Drawer "Nova Proposta" e seção "Identificação" visíveis |
| 4 | Valida campos obrigatórios | Clica em "Enviar" sem preencher | Mensagem de erro visível |
| 5 | Filtra por status | Seleciona "aprovado" no filtro | Lista filtrada sem erro |
| 6 | Botão PDF no card | Expande card existente | Botão "PDF" visível |

---

### 2.5 `05-relatorios.spec.ts` — Relatórios de Manutenção

| # | Teste | Ação | Esperado |
|---|---|---|---|
| 1 | Exibe página de relatórios | Navega para `/relatorios` | Título visível |
| 2 | FAB de novo relatório | Verifica presença do botão `+` | Botão visível |
| 3 | Abre drawer de novo relatório | Clica no FAB | Drawer "Novo Relatório" e seção "Dados Gerais" visíveis |
| 4 | Valida campos obrigatórios | Clica em "Finalizar" sem preencher | Mensagem de erro visível |
| 5 | Adiciona painel | Clica em "Adicionar" dentro do drawer | "Painel 2" aparece no formulário |

---

### 2.6 `06-usuarios.spec.ts` — Gestão de Usuários

| # | Teste | Ação | Esperado |
|---|---|---|---|
| 1 | Admin acessa página de usuários | Login como Administrador e navega para `/usuarios` | Título "Usuários" visível |
| 2 | Técnico é redirecionado | Login como Técnico e navega para `/usuarios` | URL não contém `/usuarios` |
| 3 | FAB visível para admin | Admin na página de usuários | Botão "Novo Usuário" visível |
| 4 | Abre drawer de novo usuário | Admin clica no FAB | Drawer "Novo Usuário" e campo "Nome *" visíveis |
| 5 | Filtros de status funcionam | Clica em Pendente → Aprovado → Todos | Sem erros durante a navegação |
| 6 | Histórico de logins exibido | Admin na página | Seção "Histórico de Logins" visível |

---

### 2.7 `07-dashboard.spec.ts` — Dashboard

| # | Teste | Ação | Esperado |
|---|---|---|---|
| 1 | Exibe cards de estatísticas | Navega para `/dashboard` | Textos de OS, Clientes, Relatórios ou Propostas visíveis |
| 2 | Exibe OS recentes | Aguarda carregamento | Seção de OS recentes visível |

---

## 3. Gatilho Automático (Pre-push Hook)

Configurado em `ensaio-eletrico-web/.claude/settings.json`.

Antes de qualquer `git push` no frontend, o Claude executa automaticamente:

```bash
npm run build   # tsc -b && vite build
```

Se o build falhar, o push é bloqueado. Isso garante que o código que vai para produção compila sem erros de TypeScript.

---

## 4. Cobertura Atual

| Módulo | Testes | Status |
|---|---|---|
| `auth.ts` (JWT + bcrypt) | 8 | ✅ Passando |
| `helpers.ts` (formatadores) | 6 | ✅ Passando |
| `mailer.ts` (token de ação) | 5 | ✅ Passando |
| `constants.ts` (painelVazio) | 9 | ✅ Passando |
| Login (E2E) | 6 | ✅ Implementado |
| Clientes (E2E) | 7 | ✅ Implementado |
| Ordens de Serviço (E2E) | 6 | ✅ Implementado |
| Propostas (E2E) | 6 | ✅ Implementado |
| Relatórios (E2E) | 5 | ✅ Implementado |
| Usuários (E2E) | 6 | ✅ Implementado |
| Dashboard (E2E) | 2 | ✅ Implementado |

**Total: 32 testes unitários + 44 testes E2E = 76 testes**

---

## 5. Próximos Passos Sugeridos

- [ ] Testes de integração para rotas da API (com banco de dados de teste)
- [ ] Testes E2E do fluxo completo de aprovação de OS por e-mail
- [ ] CI/CD no GitHub Actions para rodar os testes a cada push
- [ ] Aumentar cobertura: `db.ts` (proximoNumero, listar, inserir)
