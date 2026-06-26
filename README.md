# INVIX - Calendário de Dividendos!

O **Invix** é um sistema Full Stack desenvolvido para automatizar a gestão e projeção de rendimentos de dividendos. O projeto resolve a dificuldade de investidores individuais em consolidar dados e projetar rendimentos manualmente, centralizando a análise de carteiras de ativos em uma interface moderna e intuitiva.

## 🚀 Proposta de Solução

O projeto consiste em um MVP (Minimum Viable Product) que oferece:
- **Interface Web:** Desenvolvida em Angular com foco em responsividade e componentes standalone.
- **Automação:** Cálculo automatizado de rendimentos projetados para 12 meses.
- **Dados em Tempo Real:** Integração com dados de mercado reais (Brapi API) para maior precisão.
- **Gestão de Carteira:** Cadastro de perfis, ativos e persistência segura das análises no Supabase.

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
| :--- | :--- |
| **Frontend** | [Angular](https://angular.io/) (Standalone Components, HTML/CSS) |
| **Backend** | [Node.js](https://nodejs.org/) com [Express.js](https://expressjs.com/) |
| **Linguagem** | [TypeScript](https://www.typescriptlang.org/) |
| **Banco de Dados** | [PostgreSQL](https://www.postgresql.org/) (via [Supabase](https://supabase.com/)) |
| **ORM** | [TypeORM](https://typeorm.io/) |
| **Integrações** | [Brapi API](https://brapi.dev/) para cotações e dividendos |
| **Produtividade** | Notion (Kanban/Scrum), Miro (Design Thinking), Gemini Code Assist |

## 📅 Cronograma (Sprints)

- **Sprint 1 (24/04):** Setup Backend, Conexão Supabase/TypeORM e Auth.
- **Sprint 2 (08/05):** Integração API Brapi e lógica de persistência.
- **Sprint 3 (15/05):** Lógica de projeção de 12 meses e Setup Angular.
- **Sprint 4 (22/05):** Desenvolvimento de Dashboards e Integração Full Stack.
- **Sprint 5 (29/05):** Gráficos de rendimentos e Refinamento UI/UX.
- **Sprint 6 (12/06):** Testes de integração e correções.
- **Sprint 7 (19/06):** Polimento final e preparação para Deploy.
- **Finalização (26/06):** Fechamento do MVP e Documentação.

## 👥 Participantes do Projeto
- Johnny Paz
- Robson Wojcik

---
*Projeto desenvolvido como Trabalho de Conclusão de Curso (TCC).*

---

# 📦 Estrutura do Monorepo (Desenvolvimento)

Este repositório está estruturado em formato Monorepo para facilitar o desenvolvimento e deploy.

## Estrutura do Projeto

*   **`backend/`**: API RESTful desenvolvida em Node.js com TypeScript, Express e TypeORM.
*   **`frontend/`**: Aplicação SPA desenvolvida em Angular 20 com PrimeNG e Tailwind CSS.

## Como Executar Localmente

### 1. Executar o Backend

1. Entre na pasta `backend`:
   ```bash
   cd backend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure o arquivo `.env` com suas credenciais do Supabase e Brapi.
4. Execute o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

### 2. Executar o Frontend

1. Entre na pasta `frontend`:
   ```bash
   cd frontend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Execute o servidor de desenvolvimento:
   ```bash
   npm start
   ```
