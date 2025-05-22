import { Injectable, NotFoundException } from '@nestjs/common';
import { GithubService } from '../github.service';
import { RepositoryDto } from '../dto/repository.dto';

@Injectable()
export class RepositoryService {
  constructor(private readonly githubService: GithubService) {}

  /**
   * Get all repositories accessible to the authenticated user
   * @param token GitHub personal access token
   * @returns List of repositories
   */
  async findAll(token: string): Promise<RepositoryDto[]> {
    const octokit = this.githubService.createOctokitClient(token);
    const { data } = await octokit.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 100,
    });

    // Map the response to match our DTO
    return data.map(repo => ({
      id: repo.id,
      name: repo.name,
      owner: {
        login: repo.owner.login,
      },
      full_name: repo.full_name,
      description: repo.description,
      html_url: repo.html_url,
      private: repo.private,
    }));
  }

  /**
   * Get a specific repository by owner and repo name
   * @param token GitHub personal access token
   * @param owner Repository owner
   * @param repo Repository name
   * @returns Repository details
   */
  async findOne(token: string, owner: string, repo: string): Promise<RepositoryDto> {
    try {
      const octokit = this.githubService.createOctokitClient(token);
      const { data } = await octokit.repos.get({
        owner,
        repo,
      });

      // Map the response to match our DTO
      return {
        id: data.id,
        name: data.name,
        owner: {
          login: data.owner.login,
        },
        full_name: data.full_name,
        description: data.description,
        html_url: data.html_url,
        private: data.private,
      };
    } catch (error) {
      if (error.status === 404) {
        throw new NotFoundException(`Repository ${owner}/${repo} not found`);
      }
      throw error;
    }
  }
}
