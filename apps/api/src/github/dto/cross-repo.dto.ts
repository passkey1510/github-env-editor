import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CrossRepoVariableCopyDto {
  @ApiProperty({ description: 'Target repository owner' })
  @IsString()
  @IsNotEmpty()
  targetOwner: string;

  @ApiProperty({ description: 'Target repository name' })
  @IsString()
  @IsNotEmpty()
  targetRepo: string;

  @ApiProperty({ description: 'Target environment name' })
  @IsString()
  @IsNotEmpty()
  targetEnvironment: string;

  @ApiProperty({ description: 'List of variable names to copy (empty for all)' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  variables?: string[];
}
