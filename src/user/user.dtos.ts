import { IsEmail } from "class-validator";

export class SignupUserDTO {
    name?: string;

    @IsEmail()
    email: string;
}
