import { Trim } from 'class-sanitizer';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  public readonly username?: string;

  @Trim()
  @IsEmail()
  @IsOptional()
  public readonly email: string;

  @IsString()
  @MinLength(8)
  @IsOptional()
  public readonly password: string;
}
