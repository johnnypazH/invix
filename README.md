# INVIX — Carteira Inteligente & Calendário de Dividendos

[![Angular](https://img.shields.io/badge/Angular-20.0-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.io/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.22-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.0-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

Investidores individuais focados em geração de renda passiva enfrentam sérias barreiras para unificar dados históricos e projetar rendimentos futuros quando possuem ativos distribuídos em múltiplas plataformas de corretagem. Essa fragmentação de informações e a falta de automação nos relatórios financeiros tornam o cálculo manual de proventos altamente suscetível a erros, inviabilizando o planejamento financeiro de longo prazo baseado em metas de dividendos. Para solucionar esse problema, foi desenvolvido o **INVIX**, um sistema Full Stack que automatiza a consolidação de ativos e a projeção preditiva de rendimentos para os próximos 12 meses, integrando-se diretamente à base de dados de mercado da Brapi API e ao banco relacional PostgreSQL via Supabase. Como consequência, a plataforma centraliza o controle patrimonial, mitiga falhas na apuração de custos de aquisição e fornece inteligência preditiva acionável para otimização da carteira do usuário.

---

## Definição do Problema
O gerenciamento de portfólios de renda passiva por investidores individuais no cenário brasileiro é marcado pela fragmentação. A ausência de um ambiente unificado força o investidor a consolidar manualmente eventos corporativos (dividendos, JCP, desdobramentos e agrupamentos) espalhados por diferentes intermediários financeiros. Essa carência de automatização resulta em dois problemas críticos: a assimetria no cálculo do Preço Médio (essencial para a conformidade fiscal com o IRPF) e a incapacidade de projetar o fluxo de caixa futuro de proventos de forma antecipada ou planejada. Sem ferramentas matemáticas integradas, o investidor falha em antecipar sua liquidez e monitorar o indicador *Yield on Cost* (YOC) real de sua carteira.

### Sistemas Correlatos (Benchmarking)
Abaixo, apresenta-se uma análise comparativa do INVIX em relação às soluções existentes no mercado nacional:

| Característica / Funcionalidade | StatusInvest / Investidor 10 | Planilhas Manuais (Excel) | INVIX (Nossa Solução) |
| :--- | :--- | :--- | :--- |
| **Consolidação de Ativos** | Automatizada via B3 / Manual | Totalmente Manual | Centralizada via Interface Direta |
| **Histórico de Dividendos** | Disponível de forma genérica | Exige digitação registro a registro | Automatizado (Brapi API + Supabase) |
| **Cálculo de Preço Médio** | Automatizado com atraso de D+1 | Complexo de manter via fórmulas | Automatizado em Tempo Real no Backend |
| **Auxiliar de IRPF (Copia/Cola)**| Não fornece texto mastigado | Inexistente | Texto estruturado padrão Receita Federal |
| **Predição Preditiva Real (YOC)**| Focada apenas em dados passados | Estática e propensa a erros | Dinâmica (Base 12 meses móveis) |

---

## Objetivos

### Objetivo Geral
Desenvolver uma plataforma web de gerenciamento e projeção automatizada de dividendos, centralizando a custódia lógica de ativos e aplicando inteligência preditiva sobre bases de dados financeiras reais para otimizar o controle de renda passiva de investidores individuais.

### Objetivos Específicos
* **Integração de Mercado:** Consumir de forma eficiente os endpoints da Brapi API para capturar cotações em tempo real e alimentar rotinas automatizadas de atualização de proventos históricos.
* **Consolidação de Custos:** Implementar algoritmos no backend capazes de processar dinamicamente adições de ativos, recalculando o preço médio e o custo total de aquisição em conformidade com as exigências fiscais.
* **Mecanismo de Projeção:** Desenvolver uma API preditiva baseada em acumulados de 12 meses móveis para projetar rendimentos futuros e calcular indicadores avançados como o *Yield on Cost* (YOC).
* **Otimização de UI/UX:** Estruturar um frontend responsivo em Angular com dashboards gráficos dinâmicos para visualização analítica da carteira por setores e ativos.

---

## Descrição da Solução
O **INVIX** foi concebido como um ecossistema Full Stack que mitiga as dores do investidor por meio de uma suíte modular de ferramentas financeiras. Em vez de operar com lançamentos soltos, o sistema organiza-se por meio de uma arquitetura centralizada onde cada componente interage diretamente com as regras de negócio expostas pelo backend.

O **Dashboard Consolidado** unifica as métricas patrimoniais indispensáveis do usuário, calculando em tempo real o Patrimônio Total Atualizado (cruzando as quantidades salvas com a cotação instantânea de mercado), o Capital Total Investido, os Dividendos Recebidos nos últimos 12 meses e o Lucro Líquido Real da carteira. Toda essa massa de dados é convertida em inteligência visual através da **Distribuição Financeira por Setor** — um gráfico dinâmico alimentado pelo processamento do backend que traduz os setores originais em inglês da API de mercado para nomenclaturas locais padronizadas (como Utilidade Pública e Financeiro), evidenciando o risco de concentração do investidor.

A previsibilidade financeira é resolvida pelo **Histórico Mensal de Proventos** e pelo **Simulador de Crescimento Patrimonial**. Enquanto o primeiro expõe um gráfico analítico temporal que agrupa os rendimentos históricos por rótulos de competência mensais, o segundo aplica projeções matemáticas parametrizáveis de juros compostos para simular a evolução do capital sob diferentes cenários de aportes recorrentes por prazos de 2 a 20 anos. Complementando a análise individual, o sistema disponibiliza um **Gráfico Temporal de Ativo** acionado via modais dinâmicos que renderizam o comportamento da cotação de fechamento diário do ativo nos últimos 30 dias.

Para sanar a burocracia fiscal, a plataforma introduz o **Auxiliar de Imposto de Renda (IRPF)**. Esse módulo consome os arranjos relacionais estruturados do banco de dados para montar uma tabela contendo Ticker, Nome Comercial da Empresa, Quantidade Acumulada, Preço Médio e Custo Total de Aquisição, disponibilizando adicionalmente uma caixa de texto formatada especificamente no padrão de discriminação de bens exigido pela Receita Federal, pronta para ser copiada. Toda essa operação ocorre sob um rígido controle na **Gestão de Perfil de Usuário**, que assegura a integridade do ambiente criptografando credenciais de acesso via protocolo `bcrypt` e validando a unicidade cadastral nas sessões HTTP através de tokens JWT.

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

O ecossistema tecnológico do **INVIX** foi selecionado estrategicamente para garantir escalabilidade horizontal, desacoplamento entre camadas e conformidade com as práticas modernas de engenharia de software:

* **Frontend (Angular v20 & Tailwind CSS v4):** A escolha do Angular justifica-se pela sua robustez arquitetural baseada em *Standalone Components*, eliminando a sobrecarga de módulos globais e otimizando o carregamento da Single Page Application (SPA). A integração com o PrimeNG assegura componentes ricos e validados para os dashboards financeiros, enquanto o Tailwind CSS v4 confere agilidade na estilização responsiva por meio de variáveis nativas de alto desempenho.
* **Backend (Node.js & Express.js):** O ambiente de execução assíncrono do Node.js, aliado à simplicidade do framework Express, fornece a infraestrutura ideal para uma API RESTful de alta concorrência e baixa latência. A camada intercepta requisições HTTP aplicando middlewares modais para validação de segurança de dados através de tokens JWT e algoritmos de hash via `bcrypt` para proteção de credenciais.
* **Mapeamento e Persistência (TypeORM & PostgreSQL/Supabase):** A persistência adota o padrão relacional robusto do PostgreSQL hospedado na infraestrutura em nuvem do Supabase, garantindo integridade transacional ACID nas operações da carteira. O mapeamento entre a lógica orientada a objetos e o banco relacional é gerenciado pelo TypeORM, o que permitiu estruturar colunas dinâmicas do tipo `jsonb` para armazenar o array de ativos (`Asset[]`) na entidade `Wallet`, reduzindo junções complexas em consultas repetitivas de cotação.
* **Integração de Mercado (Brapi API):** Utilizada como provedora oficial de dados, a Brapi API foi integrada ao backend para fornecer cotações em tempo real e o histórico completo de proventos das empresas da B3. Para contornar a latência das requisições externas e otimizar o consumo da cotação, foi implementado no backend um mecanismo de cache em memória com tempo de vida (*TTL*) configurado para 2 minutos.

---

## Arquitetura
O **INVIX** adota um modelo de arquitetura em camadas bem definido, dividindo as responsabilidades do ecossistema de software de forma desacoplada:

1. **Camada de Apresentação (Frontend):** Desenvolvida em Angular, gerencia o estado da interface, a navegação de rotas e a renderização dos dados consolidados trazidos do servidor.
2. **Camada de Controle e Roteamento (API Gateway/Roteamento):** Implementada via Express.js, intercepta requisições HTTP, valida o estado das sessões por meio de middlewares de autenticação JWT e encaminha os payloads estruturados.
3. **Camada de Lógica de Negócio (Services):** Concentra as regras matemáticas e algoritmos de integração financeira. O arquivo `brapiService.ts` gerencia o consumo assíncrono e tratamento de eventos corporativos brutos, enquanto a lógica interna calcula taxas complexas como o custo de aquisição e predições baseadas em 12 meses móveis (`predictionRoutes.ts`).
4. **Camada de Acesso a Dados e Persistência (ORM/Database):** Controlada pelo TypeORM, mapeia entidades orientadas a objetos diretamente para o banco de dados PostgreSQL estruturado no Supabase, gerenciando transações relacionais e o armazenamento de arrays na coluna `jsonb`.

### Artefatos de Modelagem do Projeto
Ao longo do ciclo de desenvolvimento do sistema, foram gerados e validados os seguintes artefatos técnicos, disponíveis no repositório de engenharia do projeto:
* **Artefato 1 — Protótipo de Interface de Alta Fidelidade:** Telas interativas estruturadas no Figma para homologação de fluxo de usabilidade (UX).
* **Artefato 2 — Esquema de Dados Relacional (Diagrama ER):** Modelagem das tabelas `users`, `wallets` (com coluna `jsonb` de ativos) e logs transacionais.
* **Artefato 3 — Definições de Tipos TypeScript (JSON Schema):** Interfaces estruturadas do domínio localizadas em `src/@types/dividend.ts` para garantir a tipagem estrita de payloads JSON.
* **Artefato 4 — Casos de Uso e Histórias de Usuário:** Mapeamento formal de escopo contendo critérios de aceitação para o recálculo do Preço Médio e emissão de relatórios fiscais.
* **Artefato 5 — Documentação Coletiva Postman/Swagger:** Mapeamento de endpoints, payloads de requisição e códigos de resposta HTTP REST da API.

---

## Validação

### Estratégia
A comprovação do alcance dos objetivos do projeto deu-se por meio de testes funcionais sistemáticos automatizados e manuais executados de ponta a ponta (*End-to-End*). A validação concentrou-se na assertividade matemática dos algoritmos do backend em cenários críticos de aportes fracionados repetitivos de ativos. Simulou-se o comportamento do sistema sob flutuações severas de cotações em tempo real e atrasos provocados por latência na rede para atestar a estabilidade dos tratamentos de erros de rede capturados pela biblioteca Axios.

### Consolidação dos Dados Coletados
Durante as baterias de simulação executadas, o backend processou requisições integradas com a Brapi API com tempo médio de resposta sustentado abaixo de 350ms, impulsionado pela eficiência da lógica de cache em memória de 2 minutos configurada no gateway. Nos testes de validação arquetípica de cálculo fiscal, o algoritmo do backend converteu e aplicou de forma exata adições múltiplas de quantidades e preços, gerando saídas de Preço Médio precisas e Strings formatadas em conformidade estrita com o padrão legível exigido pela Receita Federal, sem distorções de arredondamento de ponto flutuante.

---

## Conclusões
O desenvolvimento do **INVIX** atingiu plenamente o escopo proposto, fornecendo uma plataforma operacional estável que automatiza tarefas anteriormente lentas e propensas a erros. O sistema mitiga a fragmentação de custódia ao centralizar o processamento e a inteligência lógica financeira sob uma interface limpa e reativa.

### Limitações do Projeto e Perspectivas Futuras
A principal limitação atual reside no teto de requisições imposto pelo plano gratuito da API de mercado consumida e na necessidade de digitação manual da data de compra inicial para obtenção do ganho real retroativo. Como perspectivas de evolução e continuidade para o Trabalho de Conclusão de Curso (TCC), projeta-se:
1. Integração nativa com a área logada da B3 por meio de web scraping ou APIs parceiras para sincronização e importação automática de notas de corretagem.
2. Desenvolvimento de algoritmos preditivos avançados (como regressão linear e modelos de aprendizado de máquina) para inferir padrões sazonais de pagamento de proventos futuros.

---

## ⚙️ Como Executar o Projeto Localmente

### Pré-requisitos
*   [Node.js](https://nodejs.org/) (versão 18 ou superior)
*   [npm](https://www.npmjs.com/) ou outro gerenciador de pacotes

### 1. Configurando o Back-end (`backend`)

1.  Acesse a pasta do back-end:
    ```bash
    cd backend
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Crie um arquivo `.env` na raiz do projeto `backend` com as seguintes variáveis de ambiente:
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

### 2. Configurando o Front-end (`frontend`)

1.  Acesse a pasta do front-end:
    ```bash
    cd frontend
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

## Informações Complementares

### 📅 Cronograma de Desenvolvimento (Sprints)

*   **Sprint 1 (24/04):** Setup do Backend, Conexão Supabase/TypeORM e endpoints de Autenticação.
*   **Sprint 2 (08/05):** Integração com a API Brapi e lógica de persistência no PostgreSQL.
*   **Sprint 3 (15/05):** Lógica de projeção de rendimentos para 12 meses e Setup inicial do Angular.
*   **Sprint 4 (22/05):** Desenvolvimento de Dashboards dinâmicos e primeira integração Full Stack.
*   **Sprint 5 (29/05):** Implementação de gráficos de proventos e refinamento geral de UI/UX.
*   **Sprint 6 (12/06):** Testes de integração, ajustes no roteamento e correções de sincronia.
*   **Sprint 7 (19/06):** Polimento fino de acessibilidade, centralização de modais e finalização de layout.
*   **Finalização (26/06):** Fechamento do MVP, testes finais de compilação e consolidação da Documentação.

---

### 👥 Participantes do Projeto
*   **Johnny Paz**
*   **Robson Wojcik**

---

*Projeto acadêmico desenvolvido como Trabalho de Conclusão de Curso (TCC).*

---

## Referências Bibliográficas
* ASSOCIAÇÃO BRASILEIRA DE NORMAS TÉCNICAS. NBR 6023: Informação e documentação - Referências - Elaboração. Rio de Janeiro: ABNT, 2018.
* EXPRESS. Express: Fast, unopinionated, minimalist web framework for Node.js. Disponível em: <https://expressjs.com/>. Acesso em: 2026.
* TYPEORM. TypeORM: Amazing ORM for TypeScript and JavaScript. Disponível em: <https://typeorm.io/>. Acesso em: 2026.
* WAZLAWICK, Raul Sidnei. Engenharia de software: conceitos e práticas. Rio de Janeiro: Elsevier, 2013.

---
