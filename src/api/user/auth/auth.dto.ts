import { Trim } from 'class-sanitizer';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @Trim()
  @IsEmail()
  public readonly email: string;

  @IsString()
  @MinLength(8)
  public readonly password: string;

  @IsString()
  public readonly username: string;
}

export class LoginDto {
  @Trim()
  @IsString()
  public readonly username: string;

  @IsString()
  public readonly password: string;
}
