# INVIX — Carteira Inteligente & Calendário de Dividendos

[![Angular](https://img.shields.io/badge/Angular-20.0-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.io/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.22-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.0-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

O **Invix** é um sistema Full Stack desenvolvido para automatizar a gestão, consolidação e projeção de rendimentos de dividendos. O projeto resolve a dificuldade de investidores individuais em unificar dados de múltiplas carteiras e calcular projeções futuras de forma manual, centralizando a análise de ativos em uma interface moderna, responsiva e de alta legibilidade.

---

## 💡 Principais Funcionalidades

O Invix oferece uma suíte completa de ferramentas financeiras pensadas para a usabilidade e clareza de investidores leigos e experientes:

*   **Dashboard Consolidado:** Métricas essenciais unificadas (Patrimônio Atual, Capital Total Investido, Dividendos Recebidos nos últimos 12 meses e Lucro Líquido Real).
*   **Detalhamento Didático:** Pop-ups interativos que detalham as equações aritméticas por trás do Ganho Total e dos Dividendos, listando a contribuição de cada ativo.
*   **Distribuição Financeira por Setor:** Gráfico de pizza/rosca dinâmico alimentado pelo valor atualizado dos ativos no mercado (cotação real), refletindo a real concentração de patrimônio.
*   **Histórico Mensal de Proventos:** Gráfico de barras verticais com rótulos amigáveis de datas (ex: `Jun/26`) para acompanhamento fácil dos rendimentos recebidos a cada mês.
*   **Simulador de Crescimento Patrimonial:** Gráfico de linha interativo de juros compostos que projeta a evolução do capital no longo prazo (de 2 a 20 anos) com base em aportes mensais recorrentes e taxas de retorno customizáveis pelo usuário.
*   **Gráfico Temporal de Ativo:** Consulta em tempo real à API Brapi para exibir a série de preços diários dos últimos 30 dias de uma ação em um modal interativo.
*   **Auxiliar de Imposto de Renda (IRPF):** Tabela consolidada contendo Ticker, Nome, Quantidade Acumulada, Preço Médio e Custo de Aquisição. Inclui caixa de **Discriminação Sugerida para IRPF** contendo o texto pronto e estruturado nos moldes da Receita Federal, bastando clicar para copiar.
*   **Gestão de Perfis de Usuário:** Atualização segura de credenciais (criptografia via `bcrypt` no back-end) com validações de unicidade de e-mail e conferência de senha atual.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia | Descrição |
| :--- | :--- | :--- |
| **Frontend** | [Angular](https://angular.io/) (v20) | Arquitetura SPA baseada em Standalone Components. |
| **UI Components** | [PrimeNG](https://primeng.org/) & [PrimeIcons](https://primeicons.org/) | Biblioteca premium de componentes ricos de interface. |
| **Estilização** | [Tailwind CSS](https://tailwindcss.com/) (v4) | Layout responsivo estruturado sobre variáveis e utilitários modernos. |
| **Backend** | [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/) | API RESTful com roteamento e middlewares de autenticação (JWT). |
| **ORM** | [TypeORM](https://typeorm.io/) | Mapeamento objeto-relacional para persistência de entidades. |
| **Banco de Dados** | [PostgreSQL](https://www.postgresql.org/) ([Supabase](https://supabase.com/)) | Banco de dados relacional hospedado na nuvem com segurança integrada. |
| **APIs Externas** | [Brapi API](https://brapi.dev/) | Consulta de cotações em tempo real e base histórica de dividendos. |

---

## ⚙️ Como Executar o Projeto Localmente

### Pré-requisitos
*   [Node.js](https://nodejs.org/) (versão 18 ou superior)
*   [npm](https://www.npmjs.com/) ou outro gerenciador de pacotes

### 1. Configurando o Back-end (`back-invix`)

1.  Acesse a pasta do back-end:
    ```bash
    cd back-invix
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Crie um arquivo `.env` na raiz do projeto `back-invix` com as seguintes variáveis de ambiente:
    ```env
    PORT=3333
    JWT_SECRET=sua_chave_secreta_aqui
    BRAPI_TOKEN=seu_token_da_brapi_aqui
    
    # Configuração de Conexão com o Supabase/PostgreSQL
    DB_HOST=seu_host_supabase
    DB_PORT=5432
    DB_USER=seu_usuario
    DB_PASS=sua_senha
    DB_NAME=seu_banco
    ```
4.  Inicie o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```

### 2. Configurando o Front-end (`invix-front/invix`)

1.  Acesse a pasta do front-end:
    ```bash
    cd invix-front/invix
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Inicie o servidor de desenvolvimento do Angular:
    ```bash
    npm run start
    ```
4.  Abra o navegador em [http://localhost:4200](http://localhost:4200).

---

## 📅 Cronograma de Desenvolvimento (Sprints)

*   **Sprint 1 (24/04):** Setup do Backend, Conexão Supabase/TypeORM e endpoints de Autenticação.
*   **Sprint 2 (08/05):** Integração com a API Brapi e lógica de persistência no PostgreSQL.
*   **Sprint 3 (15/05):** Lógica de projeção de rendimentos para 12 meses e Setup inicial do Angular.
*   **Sprint 4 (22/05):** Desenvolvimento de Dashboards dinâmicos e primeira integração Full Stack.
*   **Sprint 5 (29/05):** Implementação de gráficos de proventos e refinamento geral de UI/UX.
*   **Sprint 6 (12/06):** Testes de integração, ajustes no roteamento e correções de sincronia.
*   **Sprint 7 (19/06):** Polimento fino de acessibilidade, centralização de modais e finalização de layout.
*   **Finalização (26/06):** Fechamento do MVP, testes finais de compilação e consolidação da Documentação.

---

## 👥 Participantes do Projeto
*   **Johnny Paz**
*   **Robson Wojcik**

---
*Projeto acadêmico desenvolvido como Trabalho de Conclusão de Curso (TCC).*
