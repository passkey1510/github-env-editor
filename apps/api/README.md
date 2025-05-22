# GitHub Environment Variables API

A NestJS API for managing GitHub repository environment variables.

## Features

- View, create, edit, and delete environment variables in GitHub repository settings
- Clone all variables from one environment to another (e.g., from staging to production)
- Efficiently set up new projects by copying environment configurations
- Make targeted modifications to variables after cloning environments
- Copy variables between different repositories

## Prerequisites

- Node.js 18 or higher
- pnpm 9.0.0 or higher
- GitHub Personal Access Token with appropriate permissions:
  - `repo` scope for private repositories
  - `public_repo` scope for public repositories

## Installation

```bash
# Install dependencies
$ pnpm install
```

## Running the API

```bash
# Development mode
$ pnpm run start

# Watch mode (recommended for development)
$ pnpm run start:dev

# Production mode
$ pnpm run start:prod
```

The API will be available at `http://localhost:3000/api`.

## API Documentation

Swagger documentation is available at `http://localhost:3000/api/docs`.

## Authentication

All API endpoints require a GitHub Personal Access Token for authentication. You can provide the token in one of two ways:

1. **Authorization Header**: `Authorization: Bearer YOUR_GITHUB_TOKEN`
2. **Custom Header**: `X-GitHub-Token: YOUR_GITHUB_TOKEN`

## API Endpoints

### Repositories

- `GET /api/repositories` - List repositories accessible to the authenticated user
- `GET /api/repositories/:owner/:repo` - Get repository details

### Environments

- `GET /api/repositories/:owner/:repo/environments` - List environments for a repository
- `POST /api/repositories/:owner/:repo/environments` - Create a new environment
- `DELETE /api/repositories/:owner/:repo/environments/:name` - Delete an environment
- `POST /api/repositories/:owner/:repo/environments/:name/clone` - Clone environment to a new environment

### Variables

- `GET /api/repositories/:owner/:repo/environments/:name/variables` - List variables for an environment
- `POST /api/repositories/:owner/:repo/environments/:name/variables` - Create a new variable
- `PUT /api/repositories/:owner/:repo/environments/:name/variables/:key` - Update a variable
- `DELETE /api/repositories/:owner/:repo/environments/:name/variables/:key` - Delete a variable
- `POST /api/repositories/:owner/:repo/environments/:name/variables/copy` - Copy variables to another environment
- `POST /api/repositories/:owner/:repo/environments/:name/variables/copy-to-repo` - Copy variables to another repository

## Examples

### Clone an environment

```bash
curl -X POST \
  http://localhost:3000/api/repositories/octocat/hello-world/environments/staging/clone \
  -H 'Authorization: Bearer YOUR_GITHUB_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "targetEnvironment": "production"
  }'
```

### Copy specific variables to another environment

```bash
curl -X POST \
  http://localhost:3000/api/repositories/octocat/hello-world/environments/staging/variables/copy \
  -H 'Authorization: Bearer YOUR_GITHUB_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "targetEnvironment": "production",
    "variables": ["API_KEY", "DATABASE_URL"]
  }'
```

### Copy variables to another repository

```bash
curl -X POST \
  http://localhost:3000/api/repositories/octocat/hello-world/environments/staging/variables/copy-to-repo \
  -H 'Authorization: Bearer YOUR_GITHUB_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "targetOwner": "octocat",
    "targetRepo": "new-project",
    "targetEnvironment": "staging"
  }'
```

## License

This project is [MIT licensed](LICENSE).

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
