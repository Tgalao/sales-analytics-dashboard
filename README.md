# Sales Analytics Dashboard

Um dashboard de analise de vendas para uma loja online ficticia, com dados de clientes, produtos, encomendas e pagamentos.

## Stack

- PostgreSQL (ou MySQL)
- Next.js (App Router)
- TypeScript
- SQL (queries de agregacao)
- Charts (ex: Recharts / Chart.js)

## Modelo de dados

- Customers
- Products
- Orders
- OrderItems
- Payments

## Fluxo de dados

Database -> SQL -> API -> Data processing -> Dashboard

## Funcionalidades do dashboard

- [ ] Revenue (receita total)
- [ ] Orders (numero de encomendas)
- [ ] Average order value (valor medio por encomenda)
- [ ] Best-selling products (produtos mais vendidos)
- [ ] Sales by month (vendas por mes)
- [ ] Sales by category (vendas por categoria)
- [ ] Customer statistics (estatisticas de clientes)
- [ ] Date filters (filtros por data)

## O que este projeto demonstra

SQL + databases + data analysis + dashboards

## Roadmap de desenvolvimento

1. Ideia
2. Planeamento
3. Database / Architecture
4. Development
5. Git / Branches
6. Testing
7. Deployment
8. README
9. Screenshots
10. Demo

## Como correr localmente

npm install
cp .env.example .env
npx prisma migrate dev
npm run dev

## Autor

Tomas Seabra
