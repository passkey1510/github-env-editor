import { ApiProperty } from '@nestjs/swagger';

export class RepositoryDto {
  @ApiProperty({ description: 'Repository ID' })
  id: number;

  @ApiProperty({ description: 'Repository name' })
  name: string;

  @ApiProperty({ description: 'Repository owner' })
  owner: {
    login: string;
  };

  @ApiProperty({ description: 'Repository full name (owner/repo)' })
  full_name: string;

  @ApiProperty({ description: 'Repository description', nullable: true })
  description: string | null;

  @ApiProperty({ description: 'Repository URL' })
  html_url: string;

  @ApiProperty({ description: 'Whether the repository is private' })
  private: boolean;
}
