FROM node:22-bookworm-slim AS client-build

WORKDIR /src/reactapp1.client

COPY reactapp1.client/package.json reactapp1.client/package-lock.json ./
RUN npm ci

COPY reactapp1.client/ ./
RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS server-build

WORKDIR /src

COPY ReactApp1.Server/ReactApp1.Server.csproj ReactApp1.Server/
RUN dotnet restore ReactApp1.Server/ReactApp1.Server.csproj -p:BuildProjectReferences=false

COPY ReactApp1.Server/ ReactApp1.Server/
COPY --from=client-build /src/reactapp1.client/dist/ ReactApp1.Server/wwwroot/
RUN dotnet publish ReactApp1.Server/ReactApp1.Server.csproj -c Release --no-restore -p:BuildProjectReferences=false -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0

WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

COPY --from=server-build /app/publish/ ./

EXPOSE 8080

ENTRYPOINT ["dotnet", "ReactApp1.Server.dll"]
