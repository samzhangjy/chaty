import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateGroupDto {
  @IsNotEmpty()
  @IsNumber()
  ownerId: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsArray()
  @IsNumber({}, { each: true })
  members: number[];
}
