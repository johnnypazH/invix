# Invix — Monorepo

Este repositório contém a versão completa e integrada da aplicação **Invix**, estruturada em formato Monorepo para facilitar o desenvolvimento e deploy.

## Estrutura do Projeto

*   **`backend/`**: API RESTful desenvolvida em Node.js com TypeScript, Express e TypeORM, conectada ao Supabase.
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
