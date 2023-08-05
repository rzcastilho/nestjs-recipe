# NestJS Recipe with Prisma

## Setup

### NestJS

Create a new `NestJS` project.

```shell
$ npm i -g @nestjs/cli
$ nest new nestjs-recipe
```

### Prisma

Install and init `Prisma`.

```shell
$ cd nestjs-recipe
$ npm install prisma --save-dev
$ npx prisma init
```
## Database

### Connection

Configure database connection in `schema.prisma` file.

```hcl
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

Configure the environment variable `DATABASE_URL` in `.env` file.

```env
DATABASE_URL="file:./dev.db"
```

### Schema

Create database table in `schema.prisma`.

```hcl
model User {
  id    Int     @default(autoincrement()) @id
  email String  @unique
  name  String?
  posts Post[]
}

model Post {
  id        Int      @default(autoincrement()) @id
  title     String
  content   String?
  published Boolean? @default(false)
  author    User?    @relation(fields: [authorId], references: [id])
  authorId  Int?
}
```

Generate database mirgations.

```shell
$ npx prisma migrate dev --name init
```

### Database Client

Install and generate `Prisma` client for your schema definition.

```shell
$ npm install @prisma/client
$ npx prisma generate
```

If you update `schema.prisma`, you can update the client running the `generate` command again..

### Database Service

Create a service to instantiate the `Prisma` client and connect to the database.

```shell
$ nest generate s prisma
```

Edit the `prisma.service.ts` file with the following implementation.

```ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    async onModuleInit() {
        await this.$connect();
    }
}
```
