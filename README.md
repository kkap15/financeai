# FinanceAI

A personal finance dashboard with AI-powered insights, Plaid bank integrations, and budget tracking.

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), Tailwind CSS, Recharts |
| Backend | ASP.NET Core (.NET 10), Entity Framework Core |
| Database | PostgreSQL 16 + pgvector |
| Auth | Auth0 (`@auth0/nextjs-auth0` v4) |
| Bank data | Plaid (Sandbox) |
| AI | Azure OpenAI + Semantic Kernel (insights, embeddings, agent) |
| Monorepo | Nx |

## Prerequisites

- Node.js 20+
- .NET 10 SDK
- Docker (for Postgres)
- Auth0 tenant
- Plaid developer account
- Azure OpenAI resource

## Getting started

**1. Start the database**

```bash
docker compose up -d
```

**2. Install dependencies**

```bash
npm install
```

**3. Configure environment variables**

Frontend — `apps/frontend/.env.local`:

```env
AUTH0_SECRET=<random 32+ char secret>
AUTH0_DOMAIN=<your-tenant>.auth0.com
AUTH0_CLIENT_ID=<client id>
AUTH0_CLIENT_SECRET=<client secret>
APP_BASE_URL=http://localhost:3000
AUTH0_AUDIENCE=<your api audience>
```

Backend — uses [.NET User Secrets](https://learn.microsoft.com/en-us/aspnet/core/security/app-secrets):

```bash
cd apps/backend
dotnet user-secrets set "Auth0:Domain" "<your-tenant>.auth0.com"
dotnet user-secrets set "Auth0:Audience" "<your api audience>"
dotnet user-secrets set "Plaid:ClientId" "<plaid client id>"
dotnet user-secrets set "Plaid:Secret" "<plaid sandbox secret>"
dotnet user-secrets set "AzureOpenAI:Endpoint" "https://<resource>.openai.azure.com/"
dotnet user-secrets set "AzureOpenAI:Key" "<api key>"
dotnet user-secrets set "AzureOpenAI:DeploymentName" "<chat deployment name>"
dotnet user-secrets set "AzureOpenAI:EmbeddingDeploymentName" "<embedding deployment name>"
```

The connection string is already set in `appsettings.Development.json` and does not need to be added to user secrets.

**4. Run database migrations**

```bash
cd apps/backend && dotnet ef database update
```

**5. Start both servers**

```bash
# Backend (http://localhost:5154)
npx nx serve backend

# Frontend (http://localhost:3000)
npx nx dev frontend
```

Or run both in parallel:

```bash
npx nx run-many -t dev,serve -p frontend backend
```

## Project structure

```
FinanceAI/
├── apps/
│   ├── frontend/                  # Next.js 16 app
│   │   └── src/
│   │       ├── app/
│   │       │   ├── (authenticated)/
│   │       │   │   ├── chat/      # Agent chat page
│   │       │   │   ├── dashboard/ # Spending overview
│   │       │   │   ├── insights/  # AI insights
│   │       │   │   └── transactions/
│   │       │   ├── api/
│   │       │   │   ├── ai/        # Insights + search routes
│   │       │   │   ├── chat/      # Agent SSE route
│   │       │   │   ├── logout/    # Logout handler
│   │       │   │   ├── plaid/     # Link token + exchange
│   │       │   │   ├── transactions/
│   │       │   │   └── user/
│   │       │   └── logout/        # Logout page
│   │       ├── components/
│   │       │   ├── InactivityBanner.tsx
│   │       │   ├── InactivityModal.tsx
│   │       │   ├── InactivityWrapper.tsx
│   │       │   └── ...
│   │       ├── hooks/
│   │       │   └── useInactivityLogout.ts
│   │       └── lib/
│   │           └── auth0.ts
│   ├── backend/                   # ASP.NET Core API
│   │   ├── Modules/
│   │   │   ├── AI/                # Streaming insights
│   │   │   ├── Chat/              # Agent + finance tools
│   │   │   ├── Plaid/             # Bank connection
│   │   │   ├── Transactions/
│   │   │   └── Users/
│   │   ├── Models/                # EF Core entities
│   │   └── Data/                  # AppDbContext
│   └── frontend-e2e/              # Playwright tests
└── libs/
    └── shared-types/              # Shared TS types (Transaction, Message)
```

## Features

- **Dashboard** — spending overview and category breakdown charts
- **Transactions** — paginated transaction history with category labels
- **AI Insights** — streaming AI-generated analysis of 30-day spending patterns (Azure OpenAI)
- **Semantic search** — embedding-based transaction search using pgvector
- **Budgets** — budget creation and per-category spend tracking against monthly limits
- **Plaid integration** — connect bank accounts via Plaid Link; transactions synced with auto-generated embeddings
- **Agent Chat** — Semantic Kernel agent with tool calling: spending summaries, recent transactions, month comparisons, budget management, semantic search
- **Inactivity logout** — auto-logout after 10 minutes of inactivity with a warning banner (7 min) and confirmation modal (9 min); synced across tabs via BroadcastChannel

## API

Swagger UI is available at `http://localhost:5154/swagger` when running in development.

| Endpoint | Description |
|----------|-------------|
| `GET /api/user/me` | Returns the authenticated user (auto-creates on first login) |
| `GET /api/transactions` | Paginated transaction list (`?page&pageSize&category`) |
| `GET /api/transactions/summary` | Month-to-date spending totals by category |
| `POST /api/plaid/link-token` | Creates a Plaid Link token |
| `POST /api/plaid/exchange-token` | Exchanges public token, syncs transactions + embeddings |
| `GET /api/plaid/connections` | Lists connected bank accounts |
| `GET /api/ai/insights/stream` | Streams AI spending analysis (SSE) |
| `GET /api/ai/search?query=` | Semantic search over transactions via pgvector |
| `POST /api/chat/agent` | Streams Semantic Kernel agent responses (SSE) |
