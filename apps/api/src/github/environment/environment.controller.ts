import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EnvironmentService } from './environment.service';
import { CloneEnvironmentDto, CreateEnvironmentDto, EnvironmentDto, BulkDeleteEnvironmentsDto } from '../dto/environment.dto';
import { GithubToken } from '../decorators/github-token.decorator';
import { VariableService } from '../variable/variable.service';

@ApiTags('environments')
@Controller('repositories/:owner/:repo/environments')
export class EnvironmentController {
  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly variableService: VariableService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all environments for a repository' })
  @ApiParam({ name: 'owner', description: 'Repository owner' })
  @ApiParam({ name: 'repo', description: 'Repository name' })
  @ApiResponse({ status: 200, description: 'List of environments', type: [EnvironmentDto] })
  async findAll(
    @GithubToken() token: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ): Promise<EnvironmentDto[]> {
    return this.environmentService.findAll(token, owner, repo);
  }

  @Get(':name')
  @ApiOperation({ summary: 'Get a specific environment by name' })
  @ApiParam({ name: 'owner', description: 'Repository owner' })
  @ApiParam({ name: 'repo', description: 'Repository name' })
  @ApiParam({ name: 'name', description: 'Environment name' })
  @ApiResponse({ status: 200, description: 'Environment details', type: EnvironmentDto })
  async findOne(
    @GithubToken() token: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('name') name: string,
  ): Promise<EnvironmentDto> {
    return this.environmentService.findOne(token, owner, repo, name);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new environment' })
  @ApiParam({ name: 'owner', description: 'Repository owner' })
  @ApiParam({ name: 'repo', description: 'Repository name' })
  @ApiBody({ type: CreateEnvironmentDto })
  @ApiResponse({ status: 201, description: 'Environment created', type: EnvironmentDto })
  async create(
    @GithubToken() token: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Body() createEnvironmentDto: CreateEnvironmentDto,
  ): Promise<EnvironmentDto> {
    return this.environmentService.create(token, owner, repo, createEnvironmentDto);
  }

  @Delete(':name')
  @ApiOperation({ summary: 'Delete an environment' })
  @ApiParam({ name: 'owner', description: 'Repository owner' })
  @ApiParam({ name: 'repo', description: 'Repository name' })
  @ApiParam({ name: 'name', description: 'Environment name' })
  @ApiResponse({ status: 204, description: 'Environment deleted' })
  async remove(
    @GithubToken() token: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('name') name: string,
  ): Promise<void> {
    return this.environmentService.remove(token, owner, repo, name);
  }

  @Post('bulk-delete')
  @ApiOperation({ summary: 'Delete multiple environments' })
  @ApiParam({ name: 'owner', description: 'Repository owner' })
  @ApiParam({ name: 'repo', description: 'Repository name' })
  @ApiBody({ type: BulkDeleteEnvironmentsDto })
  @ApiResponse({
    status: 200,
    description: 'Bulk delete results',
    schema: {
      type: 'object',
      properties: {
        results: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              success: { type: 'boolean' },
              error: { type: 'string' }
            }
          }
        }
      }
    }
  })
  async bulkRemove(
    @GithubToken() token: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Body() bulkDeleteDto: BulkDeleteEnvironmentsDto,
  ): Promise<{ results: { name: string; success: boolean; error?: string }[] }> {
    const results = await this.environmentService.bulkRemove(
      token,
      owner,
      repo,
      bulkDeleteDto.environmentNames
    );
    return { results };
  }

  @Post(':name/clone')
  @ApiOperation({ summary: 'Clone an environment to a new environment' })
  @ApiParam({ name: 'owner', description: 'Repository owner' })
  @ApiParam({ name: 'repo', description: 'Repository name' })
  @ApiParam({ name: 'name', description: 'Source environment name' })
  @ApiBody({ type: CloneEnvironmentDto })
  @ApiResponse({ status: 201, description: 'Environment cloned', type: EnvironmentDto })
  async cloneEnvironment(
    @GithubToken() token: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('name') sourceEnv: string,
    @Body() cloneEnvironmentDto: CloneEnvironmentDto,
  ): Promise<EnvironmentDto> {
    // First create the target environment
    const targetEnv = await this.environmentService.create(token, owner, repo, {
      name: cloneEnvironmentDto.targetEnvironment,
    });

    // Then copy all variables from source to target
    await this.variableService.copyVariables(
      token,
      owner,
      repo,
      sourceEnv,
      cloneEnvironmentDto.targetEnvironment,
    );

    return targetEnv;
  }
}
