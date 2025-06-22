import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @MinLength(6)
  @IsNotEmpty()
  readonly password: string;

  @MinLength(6)
  @IsNotEmpty()
  readonly confirmPassword: string;
  
  @IsString()
  @IsNotEmpty()
  readonly name: string;

}
