# FinanceAI

An AI-powered personal finance dashboard. Connect your bank, track spending, chat with an AI agent, and get streaming insights — with a Pro subscription tier powered by Stripe.

🌐 **Live at [financeai.moviegasm.xyz](https://financeai.moviegasm.xyz)**

## Highlights

- Full-stack SaaS with Next.js 16 + ASP.NET Core (.NET 10)
- Plaid bank integration — connect accounts, auto-sync transactions
- AI spending insights with streaming responses (Azure OpenAI)
- Agentic finance chat powered by Semantic Kernel with tool calling
- Semantic search over transactions using pgvector embeddings
- Stripe subscriptions (Free vs Pro) with webhook-driven tier updates
- Inactivity logout with warning + confirmation modal, synced across tabs via BroadcastChannel
- CI/CD via GitHub Actions → Azure Container Registry → Azure Container Apps
- Frontend on Vercel, backend on Azure Container Apps, DB on Azure PostgreSQL

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), Tailwind CSS v4, Recharts |
| Backend | ASP.NET Core (.NET 10), Entity Framework Core |
| Database | PostgreSQL + pgvector |
| Auth | Auth0 (`@auth0/nextjs-auth0` v4) |
| Bank data | Plaid |
| AI | Azure OpenAI + Semantic Kernel |
| Payments | Stripe (subscriptions + webhooks) |
| Monorepo | Nx |
| CI/CD | GitHub Actions |
| Hosting | Vercel (frontend), Azure Container Apps (backend) |

## Prerequisites

- Node.js 20+
- .NET 10 SDK
- Docker (for Postgres)
- Auth0 tenant
- Plaid developer account
- Azure OpenAI resource
- Stripe account

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
API_URL=http://localhost:5154
AUTH0_SECRET=<random 32+ char secret>
AUTH0_DOMAIN=<your-tenant>.auth0.com
AUTH0_CLIENT_ID=<client id>
AUTH0_CLIENT_SECRET=<client secret>
APP_BASE_URL=http://localhost:3000
AUTH0_AUDIENCE=<your api audience>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<stripe publishable key>
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
dotnet user-secrets set "Stripe:SecretKey" "<stripe secret key>"
dotnet user-secrets set "Stripe:PriceId" "<stripe price id>"
dotnet user-secrets set "Stripe:WebhookSecret" "<stripe webhook secret>"
```

The connection string is set in `appsettings.Development.json` and does not need to be added to user secrets.

**4. Run database migrations**

```bash
cd apps/backend && dotnet ef database update
```

**5. Start both servers**

```bash
# Frontend (http://localhost:3000)
npm run dev --workspace=apps/frontend

# Backend (http://localhost:5154)
cd apps/backend && dotnet run
```

## Project structure

```
FinanceAI/
├── apps/
│   ├── frontend/                  # Next.js 16 app
│   │   └── src/
│   │       ├── app/
│   │       │   ├── (authenticated)/
│   │       │   │   ├── chat/          # Agent chat
│   │       │   │   ├── dashboard/     # Spending overview
│   │       │   │   ├── insights/      # AI insights
│   │       │   │   ├── budgets/       # Budget tracking
│   │       │   │   ├── transactions/  # Transaction history
│   │       │   │   └── settings/      # Subscription management
│   │       │   └── api/               # Next.js route handlers (proxy to .NET)
│   │       └── components/
│   ├── backend/                   # ASP.NET Core API
│   │   ├── Modules/
│   │   │   ├── AI/                # Streaming insights + semantic search
│   │   │   ├── Budget/            # Budget CRUD
│   │   │   ├── Chat/              # Semantic Kernel agent + finance tools
│   │   │   ├── Plaid/             # Bank connection + transaction sync
│   │   │   ├── Subscriptions/     # Stripe checkout, portal, webhooks
│   │   │   ├── Transactions/      # Transaction queries
│   │   │   └── Users/             # User management
│   │   ├── Helpers/               # ControllerHelper, StripeSubscriptionHelper
│   │   ├── Models/                # EF Core entities
│   │   └── Data/                  # AppDbContext
│   └── frontend-e2e/              # Playwright tests
└── libs/
    └── shared-types/              # Shared TS types
```

## Features

- **Dashboard** — spending overview, category breakdown chart, recent transactions
- **Transactions** — paginated history with category labels and semantic search
- **AI Insights** — streaming AI analysis of 30-day spending patterns
- **Agent Chat** — Semantic Kernel agent with tool calling: spending summaries, recent transactions, month comparisons, budget management, semantic search
- **Budgets** — create per-category monthly budgets and track spend vs limit
- **Plaid integration** — connect bank accounts via Plaid Link; transactions synced with pgvector embeddings; resync endpoint available
- **Stripe subscriptions** — Free/Pro tiers; Stripe-hosted checkout and customer portal; webhook-driven tier updates with fallback customer lookup
- **Inactivity logout** — auto-logout after 10 min of inactivity with warning (7 min) and confirmation modal (9 min); synced across tabs via BroadcastChannel

## API

Swagger UI available at `http://localhost:5154/swagger` in development.

| Endpoint | Description |
|----------|-------------|
| `GET /api/user/me` | Returns authenticated user (auto-creates on first login) |
| `GET /api/user/subscription` | Returns current subscription tier and status |
| `GET /api/transactions` | Paginated transaction list (`?page&pageSize&category`) |
| `GET /api/transactions/summary` | Month-to-date spending totals by category |
| `POST /api/plaid/link-token` | Creates a Plaid Link token |
| `POST /api/plaid/exchange-token` | Exchanges public token, syncs transactions + embeddings |
| `GET /api/plaid/connections` | Lists connected bank accounts |
| `POST /api/plaid/connections/{id}/resync` | Deletes and re-syncs all transactions for a connection |
| `GET /api/ai/insights/stream` | Streams AI spending analysis (SSE) |
| `GET /api/ai/search?query=` | Semantic search over transactions via pgvector |
| `POST /api/chat/agent` | Streams Semantic Kernel agent responses (SSE) |
| `POST /api/subscriptions/checkout` | Creates a Stripe checkout session |
| `POST /api/subscriptions/portal` | Creates a Stripe customer portal session |
| `POST /api/subscriptions/webhook` | Handles Stripe webhook events |
| `GET /api/budget` | Lists budgets for the authenticated user |
| `POST /api/budget` | Creates a new budget |

## Deployment

The backend auto-deploys to Azure Container Apps on every push to `main` that touches `apps/backend/**`, via GitHub Actions (`.github/workflows/deploy-backend.yml`). The frontend auto-deploys to Vercel via its GitHub integration.

Required GitHub secrets: `AZURE_CREDENTIALS`, `AUTH0_DOMAIN`, `AUTH0_AUDIENCE`, `DB_CONNECTION_STRING`, `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_KEY`, `AZURE_OPENAI_DEPLOYMENT`, `AZURE_OPENAI_EMBEDDING`, `PLAID_CLIENT_ID`, `PLAID_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`.
