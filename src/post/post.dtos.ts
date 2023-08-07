import { IsEmail } from "class-validator";

export class CreateDraftDTO {
    title: string;
    content?: string;

    @IsEmail()
    authorEmail: string
}
