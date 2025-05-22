import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RepositoryService } from './repository.service';
import { RepositoryDto } from '../dto/repository.dto';
import { GithubToken } from '../decorators/github-token.decorator';

@ApiTags('repositories')
@Controller('repositories')
export class RepositoryController {
  constructor(private readonly repositoryService: RepositoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get all repositories accessible to the authenticated user' })
  @ApiResponse({ status: 200, description: 'List of repositories', type: [RepositoryDto] })
  async findAll(@GithubToken() token: string): Promise<RepositoryDto[]> {
    return this.repositoryService.findAll(token);
  }

  @Get(':owner/:repo')
  @ApiOperation({ summary: 'Get a specific repository by owner and repo name' })
  @ApiParam({ name: 'owner', description: 'Repository owner' })
  @ApiParam({ name: 'repo', description: 'Repository name' })
  @ApiResponse({ status: 200, description: 'Repository details', type: RepositoryDto })
  async findOne(
    @GithubToken() token: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ): Promise<RepositoryDto> {
    return this.repositoryService.findOne(token, owner, repo);
  }
}
