import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

/**
 * Decorator to extract GitHub token from request headers
 * Usage: @GithubToken() token: string
 */
export const GithubToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    
    // Try to get token from Authorization header
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    
    // Try to get token from X-GitHub-Token header
    const githubToken = request.headers['x-github-token'];
    if (githubToken) {
      return githubToken;
    }
    
    throw new UnauthorizedException('GitHub token is required');
  },
);
