import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class VariableDto {
  @ApiProperty({ description: 'Variable name' })
  name: string;

  @ApiProperty({ description: 'Variable value' })
  value: string;

  @ApiProperty({ description: 'Variable created at' })
  created_at: string;

  @ApiProperty({ description: 'Variable updated at' })
  updated_at: string;
}

export class SecretDto {
  @ApiProperty({ description: 'Secret name' })
  name: string;

  @ApiProperty({ description: 'Secret created at' })
  created_at: string;

  @ApiProperty({ description: 'Secret updated at' })
  updated_at: string;
}

export class CreateVariableDto {
  @ApiProperty({ description: 'Variable name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Variable value' })
  @IsString()
  @IsNotEmpty()
  value: string;
}

export class CreateSecretDto {
  @ApiProperty({ description: 'Secret name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Secret value' })
  @IsString()
  @IsNotEmpty()
  value: string;
}

export class UpdateVariableDto {
  @ApiProperty({ description: 'Variable value' })
  @IsString()
  @IsNotEmpty()
  value: string;
}

export class UpdateSecretDto {
  @ApiProperty({ description: 'Secret value' })
  @IsString()
  @IsNotEmpty()
  value: string;
}

export class CopyVariablesDto {
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

export class CopySecretsDto {
  @ApiProperty({ description: 'Target environment name' })
  @IsString()
  @IsNotEmpty()
  targetEnvironment: string;

  @ApiProperty({ description: 'List of secret names to copy (empty for all)' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  secrets?: string[];
}
