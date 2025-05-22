import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class EnvironmentDto {
  @ApiProperty({ description: 'Environment name' })
  name: string;

  @ApiProperty({ description: 'Environment URL' })
  url: string;

  @ApiProperty({ description: 'Environment HTML URL' })
  html_url: string;

  @ApiProperty({ description: 'Environment created at' })
  created_at: string;

  @ApiProperty({ description: 'Environment updated at' })
  updated_at: string;
}

export class EnvironmentsResponseDto {
  @ApiProperty({ type: [EnvironmentDto] })
  environments: EnvironmentDto[];
}

export class CreateEnvironmentDto {
  @ApiProperty({ description: 'Environment name' })
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class CloneEnvironmentDto {
  @ApiProperty({ description: 'Target environment name' })
  @IsString()
  @IsNotEmpty()
  targetEnvironment: string;
}
