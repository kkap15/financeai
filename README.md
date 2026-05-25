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
| AI | Azure OpenAI (streaming insights) |
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
CLIENT_SECRET=<client secret>
APP_BASE_URL=http://localhost:3000
AUTH0_AUDIENCE=<your api audience>
```

Backend — `apps/backend/appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=financeai;Username=financeai;Password=financeai_dev"
  },
  "Auth0": {
    "Domain": "<your-tenant>.auth0.com",
    "Audience": "<your api audience>"
  },
  "Plaid": {
    "ClientId": "<plaid client id>",
    "Secret": "<plaid sandbox secret>"
  },
  "AzureOpenAI": {
    "Endpoint": "https://<resource>.openai.azure.com/",
    "Key": "<api key>"
  }
}
```

**4. Run database migrations**

```bash
cd apps/backend && dotnet ef database update
```

**5. Start both servers**

```bash
# Backend (http://localhost:5154)
npx nx serve backend

# Frontend (http://localhost:3000)
npx nx serve frontend
```

Or run both in parallel:

```bash
npx nx run-many -t serve -p frontend backend
```

## Features

- **Dashboard** — spending overview and category breakdown charts
- **Transactions** — paginated transaction history with category labels
- **AI Insights** — streaming AI-generated analysis of spending patterns (Azure OpenAI)
- **Budgets** — budget creation and tracking per category
- **Plaid integration** — connect bank accounts via Plaid Link

## API

Swagger UI is available at `http://localhost:5154/swagger` when running in development.
