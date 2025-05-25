import { Injectable, NotFoundException } from '@nestjs/common';
import { GithubService } from '../github.service';
import { CreateEnvironmentDto, EnvironmentDto, BulkDeleteEnvironmentsDto } from '../dto/environment.dto';

@Injectable()
export class EnvironmentService {
  constructor(private readonly githubService: GithubService) {}

  /**
   * Get all environments for a repository
   * @param token GitHub personal access token
   * @param owner Repository owner
   * @param repo Repository name
   * @returns List of environments
   */
  async findAll(token: string, owner: string, repo: string): Promise<EnvironmentDto[]> {
    try {
      const octokit = this.githubService.createOctokitClient(token);

      // Use pagination to get all environments
      const environments: EnvironmentDto[] = [];
      let page = 1;
      const perPage = 100; // Maximum allowed per page

      while (true) {
        const { data } = await octokit.repos.getAllEnvironments({
          owner,
          repo,
          per_page: perPage,
          page: page,
        });

        if (!data.environments || data.environments.length === 0) {
          break;
        }

        environments.push(...data.environments);

        // If we got fewer environments than the page size, we've reached the end
        if (data.environments.length < perPage) {
          break;
        }

        page++;
      }

      return environments;
    } catch (error) {
      if (error.status === 404) {
        throw new NotFoundException(`Repository ${owner}/${repo} not found`);
      }
      throw error;
    }
  }

  /**
   * Get a specific environment by name
   * @param token GitHub personal access token
   * @param owner Repository owner
   * @param repo Repository name
   * @param name Environment name
   * @returns Environment details
   */
  async findOne(token: string, owner: string, repo: string, name: string): Promise<EnvironmentDto> {
    const environments = await this.findAll(token, owner, repo);
    const environment = environments.find(env => env.name === name);

    if (!environment) {
      throw new NotFoundException(`Environment ${name} not found in repository ${owner}/${repo}`);
    }

    return environment;
  }

  /**
   * Create a new environment
   * @param token GitHub personal access token
   * @param owner Repository owner
   * @param repo Repository name
   * @param createEnvironmentDto Environment data
   * @returns Created environment
   */
  async create(
    token: string,
    owner: string,
    repo: string,
    createEnvironmentDto: CreateEnvironmentDto,
  ): Promise<EnvironmentDto> {
    const octokit = this.githubService.createOctokitClient(token);

    // GitHub API doesn't have a direct endpoint to create an environment
    // We need to create an environment by creating a deployment environment
    await octokit.repos.createOrUpdateEnvironment({
      owner,
      repo,
      environment_name: createEnvironmentDto.name,
    });

    // Get the created environment
    return this.findOne(token, owner, repo, createEnvironmentDto.name);
  }

  /**
   * Delete an environment
   * @param token GitHub personal access token
   * @param owner Repository owner
   * @param repo Repository name
   * @param name Environment name
   */
  async remove(token: string, owner: string, repo: string, name: string): Promise<void> {
    try {
      const octokit = this.githubService.createOctokitClient(token);
      await octokit.repos.deleteAnEnvironment({
        owner,
        repo,
        environment_name: name,
      });
    } catch (error) {
      if (error.status === 404) {
        throw new NotFoundException(`Environment ${name} not found in repository ${owner}/${repo}`);
      }
      throw error;
    }
  }

  /**
   * Delete multiple environments
   * @param token GitHub personal access token
   * @param owner Repository owner
   * @param repo Repository name
   * @param environmentNames Array of environment names to delete
   * @returns Array of results with success/failure status for each environment
   */
  async bulkRemove(
    token: string,
    owner: string,
    repo: string,
    environmentNames: string[]
  ): Promise<{ name: string; success: boolean; error?: string }[]> {
    const results: { name: string; success: boolean; error?: string }[] = [];
    const octokit = this.githubService.createOctokitClient(token);

    for (const name of environmentNames) {
      try {
        await octokit.repos.deleteAnEnvironment({
          owner,
          repo,
          environment_name: name,
        });
        results.push({ name, success: true });
      } catch (error) {
        let errorMessage = 'Unknown error';
        if (error.status === 404) {
          errorMessage = `Environment ${name} not found`;
        } else if (error.message) {
          errorMessage = error.message;
        }
        results.push({ name, success: false, error: errorMessage });
      }
    }

    return results;
  }
}
