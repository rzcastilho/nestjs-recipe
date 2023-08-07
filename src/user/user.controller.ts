import {
    Controller,
    Post,
    Body,
    HttpException,
    HttpStatus,
    InternalServerErrorException,
    BadRequestException,
    UploadedFiles,
    UseInterceptors,
    Get,
    Param,
    Res
} from '@nestjs/common';
import { UserService } from './user.service';
import { SignupUserDTO } from './user.dtos';
import { getError, getErrorMessage } from 'src/util';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService
    ) {}
    @Post()
    async signupUser(@Body() userData: SignupUserDTO) {
        try {
            return await this.userService.createUser(userData);
        } catch(error) {
            throw new BadRequestException(
                "Error signing up a new user",
                {
                    cause: getError(error),
                    description:  getErrorMessage(error)
                }
            )
        }
    }

    @Post('upload/:id')
    @UseInterceptors(FileFieldsInterceptor([
        {name: 'selfie', maxCount: 1},
        {name: 'document', maxCount: 1},
    ]))
    async uploadFiles(@Param('id') id: string, @UploadedFiles() files: {selfie?: Express.Multer.File[], document?: Express.Multer.File[]}) {
        console.log(files)
        return this.userService.updateUser({
            where: {
                id: Number(id)
            },
            data: {
                selfieFile: files.selfie[0].filename,
                selfieMime: files.selfie[0].mimetype,
                documentFile: files.document[0].filename,
                documentMime: files.document[0].mimetype
            }
        })
    }

    @Get('download/:id/:doctype')
    async downloadFile(@Param('id') id: string, @Param('doctype') doctype: string, @Res() res: Response) {
        if (!['document', 'selfie'].includes(doctype)) {
            throw new BadRequestException('Invalid file type, valid types are "document" and "selfie"')
        }
        const user = await this.userService.user({id: Number(id)})
        if (doctype === 'selfie') {
            return res.type(user.selfieMime).sendFile(user.selfieFile, { root: './files' });
        } else {
            return res.type(user.documentMime).sendFile(user.documentFile, { root: './files' });
        }
    }
}
