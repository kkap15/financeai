FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

RUN mkdir -p /app/data && chown -R $APP_UID /app/data

USER $APP_UID

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["apps/backend/FinanceAI.Api.csproj", "apps/backend/"]
RUN dotnet restore "apps/backend/FinanceAI.Api.csproj"
COPY . .
WORKDIR "/src/apps/backend"
RUN dotnet build "./FinanceAI.Api.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./FinanceAI.Api.csproj" -c $BUILD_CONFIGURATION -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "FinanceAI.Api.dll"]
