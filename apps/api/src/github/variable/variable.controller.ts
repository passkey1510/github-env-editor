import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { VariableService } from './variable.service';
import {
  CopyVariablesDto,
  CreateVariableDto,
  UpdateVariableDto,
  VariableDto,
  SecretDto,
  CreateSecretDto,
  UpdateSecretDto,
  CopySecretsDto
} from '../dto/variable.dto';
import { GithubToken } from '../decorators/github-token.decorator';
import { CrossRepoVariableCopyDto } from '../dto/cross-repo.dto';

@ApiTags('variables', 'secrets')
@Controller('repositories/:owner/:repo/environments/:environment')
export class VariableController {
  constructor(private readonly variableService: VariableService) {}

  @Get('variables')
  @ApiOperation({ summary: 'Get all variables for an environment' })
  @ApiParam({ name: 'owner', description: 'Repository owner' })
  @ApiParam({ name: 'repo', description: 'Repository name' })
  @ApiParam({ name: 'environment', description: 'Environment name' })
  @ApiResponse({ status: 200, description: 'List of variables', type: [VariableDto] })
  async findAll(
    @GithubToken() token: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('environment') environment: string,
  ): Promise<VariableDto[]> {
    return this.variableService.findAll(token, owner, repo, environment);
  }

  @Get('variables/:name')
  @ApiOperation({ summary: 'Get a specific variable by name' })
  @ApiParam({ name: 'owner', description: 'Repository owner' })
  @ApiParam({ name: 'repo', description: 'Repository name' })
  @ApiParam({ name: 'environment', description: 'Environment name' })
  @ApiParam({ name: 'name', description: 'Variable name' })
  @ApiResponse({ status: 200, description: 'Variable details', type: VariableDto })
  async findOne(
    @GithubToken() token: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('environment') environment: string,
    @Param('name') name: string,
  ): Promise<VariableDto> {
    return this.variableService.findOne(token, owner, repo, environment, name);
  }

  @Post('variables')
  @ApiOperation({ summary: 'Create a new variable' })
  @ApiParam({ name: 'owner', description: 'Repository owner' })
  @ApiParam({ name: 'repo', description: 'Repository name' })
  @ApiParam({ name: 'environment', description: 'Environment name' })
  @ApiBody({ type: CreateVariableDto })
  @ApiResponse({ status: 201, description: 'Variable created', type: VariableDto })
  async create(
    @GithubToken() token: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('environment') environment: string,
    @Body() createVariableDto: CreateVariableDto,
  ): Promise<VariableDto> {
    return this.variableService.create(token, owner, repo, environment, createVariableDto);
  }

  @Put('variables/:name')
  @ApiOperation({ summary: 'Update a variable' })
  @ApiParam({ name: 'owner', description: 'Repository owner' })
  @ApiParam({ name: 'repo', description: 'Repository name' })
  @ApiParam({ name: 'environment', description: 'Environment name' })
  @ApiParam({ name: 'name', description: 'Variable name' })
  @ApiBody({ type: UpdateVariableDto })
  @ApiResponse({ status: 200, description: 'Variable updated', type: VariableDto })
  async update(
    @GithubToken() token: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('environment') environment: string,
    @Param('name') name: string,
    @Body() updateVariableDto: UpdateVariableDto,
  ): Promise<VariableDto> {
    return this.variableService.update(token, owner, repo, environment, name, updateVariableDto);
  }

  @Delete('variables/:name')
  @ApiOperation({ summary: 'Delete a variable' })
  @ApiParam({ name: 'owner', description: 'Repository owner' })
  @ApiParam({ name: 'repo', description: 'Repository name' })
  @ApiParam({ name: 'environment', description: 'Environment name' })
  @ApiParam({ name: 'name', description: 'Variable name' })
  @ApiResponse({ status: 204, description: 'Variable deleted' })
  async remove(
    @GithubToken() token: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('environment') environment: string,
    @Param('name') name: string,
  ): Promise<void> {
    return this.variableService.remove(token, owner, repo, environment, name);
  }

  @Post('variables/copy')
  @ApiOperation({ summary: 'Copy variables to another environment' })
  @ApiParam({ name: 'owner', description: 'Repository owner' })
  @ApiParam({ name: 'repo', description: 'Repository name' })
  @ApiParam({ name: 'environment', description: 'Source environment name' })
  @ApiBody({ type: CopyVariablesDto })
  @ApiResponse({ status: 204, description: 'Variables copied' })
  async copyVariables(
    @GithubToken() token: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('environment') sourceEnv: string,
    @Body() copyVariablesDto: CopyVariablesDto,
  ): Promise<void> {
    return this.variableService.copyVariables(
      token,
      owner,
      repo,
      sourceEnv,
      copyVariablesDto.targetEnvironment,
      copyVariablesDto.variables,
    );
  }

  @Post('variables/copy-to-repo')
  @ApiOperation({ summary: 'Copy variables to another repository' })
  @ApiParam({ name: 'owner', description: 'Source repository owner' })
  @ApiParam({ name: 'repo', description: 'Source repository name' })
  @ApiParam({ name: 'environment', description: 'Source environment name' })
  @ApiBody({ type: CrossRepoVariableCopyDto })
  @ApiResponse({ status: 204, description: 'Variables copied to another repository' })
  async copyVariablesToRepo(
    @GithubToken() token: string,
    @Param('owner') sourceOwner: string,
    @Param('repo') sourceRepo: string,
    @Param('environment') sourceEnv: string,
    @Body() crossRepoDto: CrossRepoVariableCopyDto,
  ): Promise<void> {
    // Get source variables
    const sourceVariables = await this.variableService.findAll(
      token,
      sourceOwner,
      sourceRepo,
      sourceEnv,
    );

    // Filter variables if names are provided
    const variablesToCopy = crossRepoDto.variables && crossRepoDto.variables.length > 0
      ? sourceVariables.filter(v => crossRepoDto.variables!.includes(v.name))
      : sourceVariables;

    // Copy each variable to target repository environment
    const octokit = this.variableService['githubService'].createOctokitClient(token);

    for (const variable of variablesToCopy) {
      try {
        await octokit.actions.createEnvironmentVariable({
          owner: crossRepoDto.targetOwner,
          repo: crossRepoDto.targetRepo,
          environment_name: crossRepoDto.targetEnvironment,
          name: variable.name,
          value: variable.value,
        });
      } catch (error) {
        // If variable already exists, update it
        if (error.status === 422) {
          await octokit.actions.updateEnvironmentVariable({
            owner: crossRepoDto.targetOwner,
            repo: crossRepoDto.targetRepo,
            environment_name: crossRepoDto.targetEnvironment,
            name: variable.name,
            value: variable.value,
          });
        } else {
          throw error;
        }
      }
    }
  }

  // Secrets endpoints
  @Get('secrets')
  @ApiOperation({ summary: 'Get all secrets for an environment' })
  @ApiParam({ name: 'owner', description: 'Repository owner' })
  @ApiParam({ name: 'repo', description: 'Repository name' })
  @ApiParam({ name: 'environment', description: 'Environment name' })
  @ApiResponse({ status: 200, description: 'List of secrets', type: [SecretDto] })
  async findAllSecrets(
    @GithubToken() token: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('environment') environment: string,
  ): Promise<SecretDto[]> {
    return this.variableService.findAllSecrets(token, owner, repo, environment);
  }

  @Get('secrets/:name')
  @ApiOperation({ summary: 'Get a specific secret by name' })
  @ApiParam({ name: 'owner', description: 'Repository owner' })
  @ApiParam({ name: 'repo', description: 'Repository name' })
  @ApiParam({ name: 'environment', description: 'Environment name' })
  @ApiParam({ name: 'name', description: 'Secret name' })
  @ApiResponse({ status: 200, description: 'Secret details', type: SecretDto })
  async findOneSecret(
    @GithubToken() token: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('environment') environment: string,
    @Param('name') name: string,
  ): Promise<SecretDto> {
    return this.variableService.findOneSecret(token, owner, repo, environment, name);
  }

  @Post('secrets')
  @ApiOperation({ summary: 'Create a new secret' })
  @ApiParam({ name: 'owner', description: 'Repository owner' })
  @ApiParam({ name: 'repo', description: 'Repository name' })
  @ApiParam({ name: 'environment', description: 'Environment name' })
  @ApiBody({ type: CreateSecretDto })
  @ApiResponse({ status: 201, description: 'Secret created', type: SecretDto })
  async createSecret(
    @GithubToken() token: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('environment') environment: string,
    @Body() createSecretDto: CreateSecretDto,
  ): Promise<SecretDto> {
    return this.variableService.createSecret(token, owner, repo, environment, createSecretDto);
  }

  @Put('secrets/:name')
  @ApiOperation({ summary: 'Update a secret' })
  @ApiParam({ name: 'owner', description: 'Repository owner' })
  @ApiParam({ name: 'repo', description: 'Repository name' })
  @ApiParam({ name: 'environment', description: 'Environment name' })
  @ApiParam({ name: 'name', description: 'Secret name' })
  @ApiBody({ type: UpdateSecretDto })
  @ApiResponse({ status: 200, description: 'Secret updated', type: SecretDto })
  async updateSecret(
    @GithubToken() token: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('environment') environment: string,
    @Param('name') name: string,
    @Body() updateSecretDto: UpdateSecretDto,
  ): Promise<SecretDto> {
    return this.variableService.updateSecret(token, owner, repo, environment, name, updateSecretDto);
  }

  @Delete('secrets/:name')
  @ApiOperation({ summary: 'Delete a secret' })
  @ApiParam({ name: 'owner', description: 'Repository owner' })
  @ApiParam({ name: 'repo', description: 'Repository name' })
  @ApiParam({ name: 'environment', description: 'Environment name' })
  @ApiParam({ name: 'name', description: 'Secret name' })
  @ApiResponse({ status: 204, description: 'Secret deleted' })
  async removeSecret(
    @GithubToken() token: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('environment') environment: string,
    @Param('name') name: string,
  ): Promise<void> {
    return this.variableService.removeSecret(token, owner, repo, environment, name);
  }

  @Post('secrets/copy')
  @ApiOperation({ summary: 'Copy secrets to another environment' })
  @ApiParam({ name: 'owner', description: 'Repository owner' })
  @ApiParam({ name: 'repo', description: 'Repository name' })
  @ApiParam({ name: 'environment', description: 'Source environment name' })
  @ApiBody({ type: CopySecretsDto })
  @ApiResponse({ status: 204, description: 'Secrets copied' })
  async copySecrets(
    @GithubToken() token: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('environment') sourceEnv: string,
    @Body() copySecretsDto: CopySecretsDto,
  ): Promise<void> {
    return this.variableService.copySecrets(
      token,
      owner,
      repo,
      sourceEnv,
      copySecretsDto.targetEnvironment,
      copySecretsDto.secrets,
    );
  }
}
