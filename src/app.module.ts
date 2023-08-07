import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { UserService } from './user/user.service';
import { PostService } from './post/post.service';
import { PostController } from './post/post.controller';
import { UserController } from './user/user.controller';
import { MulterModule } from '@nestjs/platform-express';

@Module({
    imports: [
        MulterModule.register({
            dest: './files',
        })
    ],
    controllers: [PostController, UserController],
    providers: [PrismaService, UserService, PostService],
})
export class AppModule {}
