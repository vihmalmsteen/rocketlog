**O projeto: rocketlog**

![alt text](./pics/o-projeto.png)


Para rodar o projeto, 3 terminais. Para cada um, setados na raíz do projeto:

```bash
npm run dev                       # liga o server
docker start postgres             # liga o container do postgres (o container deve ser criado antes com o docker-compose)
npx prisma studio                 # abre o prisma studio no navegador para manipular o DB
```

Para buildar o projeto de TS pra JS (módulo seguinte):

```bash
npm run build
```

**Packages & config TypeScript:**

```bash
npm i express@4.19.2
npm i --save-dev @types/express@4.17.21
npm i typescript@5.5.4 @types/node@20.14.12 -D
npm i tsx@4.16.2 -D
npm i express-async-errors@3.1.1
npm i zod@3.23.8
npm i prisma@5.19.1 -D
npm i bcrypt@5.1.1 @types/bcrypt@5.0.2
npm i jsonwebtoken@9.0.2 @types/jsonwebtoken@9.0.6
npm i jest@29.7.0 @types/jest@29.5.13 ts-jest@29.2.5 -D
npm i supertest@7.0.0 @types/supertest@6.0.2 -D
npm i ts-node@10.9.2 -D
npm i tsup@8.3.0 -D                                   # do módulo seguinte, para converter TS para JS e seguir com o deploy

npx tsc --init                                        # cria o tsconfig.json
npx prisma init --datasource-provider postgresql      # configura o prisma, criando a pasta
npx jest --init
```

**tsconfig.json:**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "paths": {
      "@/*": ["./src/*"]
    },
    "module": "node16",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true
  }
}
```

**package.json:**

```json
  "scripts": {
    "dev": "tsx watch src/server.ts"
  }
```

**Instalando as imagens dos containers**

Criar o arquivo `docker-compose.yml` dentro da pasta `src` do projeto com as configs:

```yml
services:
  postgres:
    image: "bitnami/postgresql:latest"
    container_name: postgres
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: rocketlog
```

No terminal com o caminho setado para a pasta que contém o `docker-compose.yml`, executar:

```bash
docker-compose up -d          # instala conforme a config do arquivo yml
docker ps -a                  # lista todas as imagens (check)
```

Conectar ao DB com as credenciais definidas no `docker-compose.yml`.

**Configurando o prisma**

Ao executar o comando abaixo no terminal setado na raíz do projeto, a pasta de configuração do prisma é criada e o `.env`:

```bash
npx prisma init --datasource-provider postgresql
```

Em seguida, editar o `.env` de acordo com as credenciais do DB:

```json
// DATABASE_URL="postgresql://johndoe:randompassword@localhost:5432/mydb?schema=public"    /*padrao*/
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/rocketlog?schema=public"       /*ajustado*/
```

Editar o `package.json` para garantir que as vars de ambiente sejam carregadas na execução do server:

```json
  "scripts": {
    "dev": "tsx watch --env-file .env src/server.ts"
  },
```

**Estrutura do DB**

![alt text](./pics/estrutura-do-db.png)

Definir dentro do arquvo do prisma as tabelas:

```prisma
// Tabela de usuários
enum UserRole {
  customer
  sales
}

model User {
  id         String     @id @default(uuid())
  name       String
  email      String
  password   String
  role       UserRole   @default(customer)
  deliveries Delivery[] // PK: relacionamento com Delivery.userId ([] pq podem ser mtas entregas por user)
  createdAt  DateTime   @default(now()) @map("created_at")
  updatedAt  DateTime?  @updatedAt @map("updated_at")

  @@map("users")
}

// Tabela de entregas
enum DeliveryStatus {
  processing
  shipped
  delivered
}

model Delivery {
  id          String         @id @default(uuid())
  userId      String         @map("user_id")
  description String
  status      DeliveryStatus @default(processing)
  user        User           @relation(fields: [userId], references: [id]) // FK: relacionamento com User.id
  logs        DeliveryLog[] // PK: relacionamento com DeliveryLogs.deliveryId ([] pq podem ser mtos logs por entrega)
  createdAt   DateTime       @default(now()) @map("created_at")
  updatedAt   DateTime?      @updatedAt @map("updated_at")

  @@map("deliveries")
}

// Tabela de logs de entregas
model DeliveryLog {
  id          String    @id @default(uuid())
  description String
  deliveryId  String    @map("delivery_id")
  delivery    Delivery  @relation(fields: [deliveryId], references: [id]) // FK: relacionameno com Delivery.id
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime? @updatedAt @map("updated_at")

  @@map("delivery_logs")
}
```

E executar no terminal:

```bash
npx prisma migrate dev
```

A *migration* será criada dentro da pasta do prisma. Executando o comando abaixo, o **prisma studio**, para manipular o banco via navegador, será aberto:

```bash
npx prisma studio
```

Criar o arquivo `src/database/prisma.ts` e inserir a config de conexão do client com o banco:

```ts
import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error']
})
```

