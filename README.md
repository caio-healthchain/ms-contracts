# ms-contracts

Microsserviço de gestão e validação de contratos hospitalares.

## Funcionalidades

- ✅ Gestão de contratos entre hospital e operadoras
- ✅ Validação de valores contratuais
- ✅ Validação de pacote contratual
- ✅ Validação de materiais inclusos
- ✅ CQRS com PostgreSQL (write) e Cosmos DB (read)
- ✅ API REST completa
- ✅ Deploy em Azure Kubernetes Service (AKS)

## Tecnologias

- Node.js 20
- Express.js
- Prisma ORM
- PostgreSQL (write model)
- Azure Cosmos DB / MongoDB (read model)
- Docker
- Kubernetes

## Endpoints

### Contratos

- `GET /api/contracts` - Lista contratos
- `GET /api/contracts/:id` - Busca contrato por ID
- `GET /api/contracts/:id/items` - Lista itens do contrato
- `GET /api/contracts/:id/items/:codigoTUSS` - Busca item específico
- `POST /api/contracts` - Cria contrato
- `PUT /api/contracts/:id` - Atualiza contrato
- `DELETE /api/contracts/:id` - Deleta contrato (soft delete)

### Validações

- `POST /api/validations/valor` - Valida valor de procedimento
- `POST /api/validations/pacote` - Valida se procedimento está no pacote
- `POST /api/validations/materiais` - Valida materiais inclusos
- `POST /api/validations/procedimento` - Validação completa de procedimento
- `POST /api/validations/guia` - Validação de guia completa

## Instalação

```bash
# Instalar dependências
npm install

# Gerar Prisma Client
npx prisma generate

# Executar migrations
npx prisma db push
```

## Desenvolvimento

```bash
# Modo desenvolvimento
npm run dev

# Testes
npm test
```

## Deploy

```bash
# Build da imagem Docker
docker build -t lazarusms.azurecr.io/ms-contracts:latest .

# Push para Azure Container Registry
docker push lazarusms.azurecr.io/ms-contracts:latest

# Deploy no Kubernetes
kubectl apply -f k8s-deployment.yaml
```

## Variáveis de Ambiente

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require

# Cosmos DB
COSMOSDB_URI=mongodb+srv://user:password@host/?tls=true
COSMOSDB_DATABASE=lazarus

# Server
PORT=3001
NODE_ENV=production
```

## Exemplos de Uso

### Validar Valor de Procedimento

```bash
curl -X POST http://localhost:3001/api/validations/valor \
  -H "Content-Type: application/json" \
  -d '{
    "operadoraId": "5460ecf6-3ea2-4088-bd8a-6198cfe2d76f",
    "codigoTUSS": "30707013",
    "valorCobrado": 27300.00
  }'
```

### Validar Guia Completa

```bash
curl -X POST http://localhost:3001/api/validations/guia \
  -H "Content-Type: application/json" \
  -d '{
    "operadoraId": "5460ecf6-3ea2-4088-bd8a-6198cfe2d76f",
    "procedimentos": [
      {
        "codigoTUSS": "30707013",
        "valorCobrado": 27300.00,
        "materiaisCobrados": [
          {
            "descricao": "Stent farmacológico",
            "quantidade": 1
          }
        ]
      }
    ]
  }'
```

## Arquitetura CQRS

O microsserviço implementa CQRS (Command Query Responsibility Segregation):

- **Write Model (PostgreSQL):** Operações de escrita (CREATE, UPDATE, DELETE)
- **Read Model (Cosmos DB):** Operações de leitura otimizadas (GET, LIST)

A sincronização entre os modelos é feita automaticamente após cada operação de escrita.

## Licença

MIT
