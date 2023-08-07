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
  id         Int       @default(autoincrement()) @id
  title      String
  content    String?
  published  Boolean?  @default(false)
  author     User?     @relation(fields: [authorId], references: [id])
  authorId   Int?
  category   Category? @relation(fields: [categoryId], references: [id])
  categoryId Int?
}

model Category {
  id          Int       @default(autoincrement()) @id
  name        String
  description String
  posts       Post[]
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

If you update `schema.prisma`, you can update the client running the `generate` command again.

### Seed

TODO

## Services

### Prisma Service

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

### User Service

Create a service to manipulate users.

```shell
$ nest generate s user
```

Edit the `user.service.ts` file with the following implementation.

```ts
import { Injectable } from '@nestjs/common';
import { User, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async user(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    });
  }

  async users(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    const { where, data } = params;
    return this.prisma.user.update({
      data,
      where,
    });
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prisma.user.delete({
      where,
    });
  }
}
```

### Post Service

Create a service to manipulate posts.

```shell
$ nest generate s post
```

Edit the `post.service.ts` file with the following implementation.

```ts
import { Injectable } from '@nestjs/common';
import { Post, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  async post(
    postWhereUniqueInput: Prisma.PostWhereUniqueInput,
  ): Promise<Post | null> {
    return this.prisma.post.findUnique({
      where: postWhereUniqueInput,
    });
  }

  async posts(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.PostWhereUniqueInput;
    where?: Prisma.PostWhereInput;
    orderBy?: Prisma.PostOrderByWithRelationInput;
  }): Promise<Post[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.post.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createPost(data: Prisma.PostCreateInput): Promise<Post> {
    return this.prisma.post.create({
      data,
    });
  }

  async updatePost(params: {
    where: Prisma.PostWhereUniqueInput;
    data: Prisma.PostUpdateInput;
  }): Promise<Post> {
    const { data, where } = params;
    return this.prisma.post.update({
      data,
      where,
    });
  }

  async deletePost(where: Prisma.PostWhereUniqueInput): Promise<Post> {
    return this.prisma.post.delete({
      where,
    });
  }
}
```

## Controllers

### Post Controller

Create a controller with post routes.

```shell
$ nest generate co post
```

Edit the `post.controller.ts` file with the following implementation.

```ts
import {
    Controller,
    Get,
    Param,
    Post,
    Body,
    Put,
    Delete,
} from '@nestjs/common';
import { Post as PostModel } from '@prisma/client';
import { PostService } from './post.service';

@Controller('post')
export class PostController {
    constructor(
        private readonly postService: PostService,
    ) {}

    @Get(':id')
    async getPostById(@Param('id') id: string): Promise<PostModel> {
        return this.postService.post({ id: Number(id) });
    }

    @Get('feed')
    async getPublishedPosts(): Promise<PostModel[]> {
        return this.postService.posts({
            where: { published: true },
        });
    }

    @Get('filter/:searchString')
    async getFilteredPosts(
        @Param('searchString') searchString: string,
    ): Promise<PostModel[]> {
        return this.postService.posts({
            where: {
                OR: [
                    {
                        title: { contains: searchString },
                    },
                    {
                        content: { contains: searchString },
                    },
                ],
            },
        });
    }

    @Post()
    async createDraft(
        @Body() postData: { title: string; content?: string; authorEmail: string },
    ): Promise<PostModel> {
        const { title, content, authorEmail } = postData;
        return this.postService.createPost({
            title,
            content,
            author: {
                connect: { email: authorEmail },
            },
        });
    }

    @Put('publish/:id')
    async publishPost(@Param('id') id: string): Promise<PostModel> {
        return this.postService.updatePost({
            where: { id: Number(id) },
            data: { published: true },
        });
    }

    @Delete(':id')
    async deletePost(@Param('id') id: string): Promise<PostModel> {
        return this.postService.deletePost({ id: Number(id) });
    }
}
```

### User Controller

Create a controller with user routes.

```shell
$ nest generate co user
```

Edit the `user.controller.ts` file with the following implementation.

```ts
import {
    Controller,
    Post,
    Body
} from '@nestjs/common';
import { UserService } from './user.service';
import { User as UserModel } from '@prisma/client';

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService
    ) {}
    @Post()
    async signupUser(
        @Body() userData: { name?: string; email: string },
    ): Promise<UserModel> {
        return this.userService.createUser(userData);
    }
}
```
