import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Octokit } from '@octokit/rest';

@Injectable()
export class GithubService {
  /**
   * Creates an authenticated Octokit instance using the provided token
   * @param token GitHub personal access token
   * @returns Authenticated Octokit instance
   */
  createOctokitClient(token: string): Octokit {
    if (!token) {
      throw new UnauthorizedException('GitHub token is required');
    }

    return new Octokit({
      auth: token,
    });
  }

  /**
   * Validates that the provided GitHub token is valid
   * @param token GitHub personal access token
   * @returns True if the token is valid
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      const octokit = this.createOctokitClient(token);
      const { data } = await octokit.users.getAuthenticated();
      return !!data;
    } catch (error) {
      return false;
    }
  }
}
