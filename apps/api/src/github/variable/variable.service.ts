import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { GithubService } from '../github.service';
import {
  CreateVariableDto,
  UpdateVariableDto,
  VariableDto,
  SecretDto,
  CreateSecretDto,
  UpdateSecretDto
} from '../dto/variable.dto';

@Injectable()
export class VariableService {
  constructor(private readonly githubService: GithubService) {}

  /**
   * Get all variables for an environment
   * @param token GitHub personal access token
   * @param owner Repository owner
   * @param repo Repository name
   * @param environment Environment name
   * @returns List of variables
   */
  async findAll(
    token: string,
    owner: string,
    repo: string,
    environment: string,
  ): Promise<VariableDto[]> {
    try {
      const octokit = this.githubService.createOctokitClient(token);
      const { data } = await octokit.actions.listEnvironmentVariables({
        owner,
        repo,
        environment_name: environment,
        per_page: 100,
      });

      return data.variables || [];
    } catch (error) {
      if (error.status === 404) {
        throw new NotFoundException(
          `Environment ${environment} not found in repository ${owner}/${repo}`,
        );
      }
      throw error;
    }
  }

  /**
   * Get a specific variable by name
   * @param token GitHub personal access token
   * @param owner Repository owner
   * @param repo Repository name
   * @param environment Environment name
   * @param name Variable name
   * @returns Variable details
   */
  async findOne(
    token: string,
    owner: string,
    repo: string,
    environment: string,
    name: string,
  ): Promise<VariableDto> {
    const variables = await this.findAll(token, owner, repo, environment);
    const variable = variables.find(v => v.name === name);

    if (!variable) {
      throw new NotFoundException(
        `Variable ${name} not found in environment ${environment} of repository ${owner}/${repo}`,
      );
    }

    return variable;
  }

  /**
   * Create a new variable
   * @param token GitHub personal access token
   * @param owner Repository owner
   * @param repo Repository name
   * @param environment Environment name
   * @param createVariableDto Variable data
   * @returns Created variable
   */
  async create(
    token: string,
    owner: string,
    repo: string,
    environment: string,
    createVariableDto: CreateVariableDto,
  ): Promise<VariableDto> {
    try {
      const octokit = this.githubService.createOctokitClient(token);
      await octokit.actions.createEnvironmentVariable({
        owner,
        repo,
        environment_name: environment,
        name: createVariableDto.name,
        value: createVariableDto.value,
      });

      return this.findOne(token, owner, repo, environment, createVariableDto.name);
    } catch (error) {
      if (error.status === 404) {
        throw new NotFoundException(
          `Environment ${environment} not found in repository ${owner}/${repo}`,
        );
      }
      throw error;
    }
  }

  /**
   * Update a variable
   * @param token GitHub personal access token
   * @param owner Repository owner
   * @param repo Repository name
   * @param environment Environment name
   * @param name Variable name
   * @param updateVariableDto Variable data
   * @returns Updated variable
   */
  async update(
    token: string,
    owner: string,
    repo: string,
    environment: string,
    name: string,
    updateVariableDto: UpdateVariableDto,
  ): Promise<VariableDto> {
    try {
      const octokit = this.githubService.createOctokitClient(token);
      await octokit.actions.updateEnvironmentVariable({
        owner,
        repo,
        environment_name: environment,
        name,
        value: updateVariableDto.value,
      });

      return this.findOne(token, owner, repo, environment, name);
    } catch (error) {
      if (error.status === 404) {
        throw new NotFoundException(
          `Variable ${name} not found in environment ${environment} of repository ${owner}/${repo}`,
        );
      }
      throw error;
    }
  }

  /**
   * Delete a variable
   * @param token GitHub personal access token
   * @param owner Repository owner
   * @param repo Repository name
   * @param environment Environment name
   * @param name Variable name
   */
  async remove(
    token: string,
    owner: string,
    repo: string,
    environment: string,
    name: string,
  ): Promise<void> {
    try {
      const octokit = this.githubService.createOctokitClient(token);
      await octokit.actions.deleteEnvironmentVariable({
        owner,
        repo,
        environment_name: environment,
        name,
      });
    } catch (error) {
      if (error.status === 404) {
        throw new NotFoundException(
          `Variable ${name} not found in environment ${environment} of repository ${owner}/${repo}`,
        );
      }
      throw error;
    }
  }

  /**
   * Copy variables from one environment to another
   * @param token GitHub personal access token
   * @param owner Repository owner
   * @param repo Repository name
   * @param sourceEnv Source environment name
   * @param targetEnv Target environment name
   * @param variableNames Optional list of variable names to copy (if empty, copy all)
   */
  /**
   * Get all secrets for an environment
   * @param token GitHub personal access token
   * @param owner Repository owner
   * @param repo Repository name
   * @param environment Environment name
   * @returns List of secrets
   */
  async findAllSecrets(
    token: string,
    owner: string,
    repo: string,
    environment: string,
  ): Promise<SecretDto[]> {
    try {
      const octokit = this.githubService.createOctokitClient(token);
      const { data } = await octokit.actions.listEnvironmentSecrets({
        owner,
        repo,
        environment_name: environment,
        per_page: 100,
      });

      return data.secrets || [];
    } catch (error) {
      if (error.status === 404) {
        throw new NotFoundException(
          `Environment ${environment} not found in repository ${owner}/${repo}`,
        );
      }
      throw error;
    }
  }

  /**
   * Get a specific secret by name
   * @param token GitHub personal access token
   * @param owner Repository owner
   * @param repo Repository name
   * @param environment Environment name
   * @param name Secret name
   * @returns Secret details
   */
  async findOneSecret(
    token: string,
    owner: string,
    repo: string,
    environment: string,
    name: string,
  ): Promise<SecretDto> {
    const secrets = await this.findAllSecrets(token, owner, repo, environment);
    const secret = secrets.find(s => s.name === name);

    if (!secret) {
      throw new NotFoundException(
        `Secret ${name} not found in environment ${environment} of repository ${owner}/${repo}`,
      );
    }

    return secret;
  }

  /**
   * Create a new secret
   * @param token GitHub personal access token
   * @param owner Repository owner
   * @param repo Repository name
   * @param environment Environment name
   * @param createSecretDto Secret data
   * @returns Created secret
   */
  async createSecret(
    token: string,
    owner: string,
    repo: string,
    environment: string,
    createSecretDto: CreateSecretDto,
  ): Promise<SecretDto> {
    try {
      const octokit = this.githubService.createOctokitClient(token);

      // Get the public key for the repository
      const { data: publicKeyData } = await octokit.actions.getEnvironmentPublicKey({
        owner,
        repo,
        environment_name: environment,
      });

      // Import the sodium library for encryption
      const sodium = require('libsodium-wrappers');

      // Ensure sodium is ready
      await sodium.ready;

      // Convert the secret value to a Uint8Array
      const messageBytes = Buffer.from(createSecretDto.value);

      // Convert the public key to a Uint8Array
      const keyBytes = Buffer.from(publicKeyData.key, 'base64');

      // Encrypt the secret using the public key
      const encryptedBytes = sodium.crypto_box_seal(messageBytes, keyBytes);

      // Convert the encrypted value to a base64 string
      const encrypted = Buffer.from(encryptedBytes).toString('base64');

      // Create the secret
      await octokit.actions.createOrUpdateEnvironmentSecret({
        owner,
        repo,
        environment_name: environment,
        secret_name: createSecretDto.name,
        encrypted_value: encrypted,
        key_id: publicKeyData.key_id,
      });

      return this.findOneSecret(token, owner, repo, environment, createSecretDto.name);
    } catch (error) {
      if (error.status === 404) {
        throw new NotFoundException(
          `Environment ${environment} not found in repository ${owner}/${repo}`,
        );
      }
      throw error;
    }
  }

  /**
   * Update a secret
   * @param token GitHub personal access token
   * @param owner Repository owner
   * @param repo Repository name
   * @param environment Environment name
   * @param name Secret name
   * @param updateSecretDto Secret data
   * @returns Updated secret
   */
  async updateSecret(
    token: string,
    owner: string,
    repo: string,
    environment: string,
    name: string,
    updateSecretDto: UpdateSecretDto,
  ): Promise<SecretDto> {
    try {
      const octokit = this.githubService.createOctokitClient(token);

      // Get the public key for the repository
      const { data: publicKeyData } = await octokit.actions.getEnvironmentPublicKey({
        owner,
        repo,
        environment_name: environment,
      });

      // Import the sodium library for encryption
      const sodium = require('libsodium-wrappers');

      // Ensure sodium is ready
      await sodium.ready;

      // Convert the secret value to a Uint8Array
      const messageBytes = Buffer.from(updateSecretDto.value);

      // Convert the public key to a Uint8Array
      const keyBytes = Buffer.from(publicKeyData.key, 'base64');

      // Encrypt the secret using the public key
      const encryptedBytes = sodium.crypto_box_seal(messageBytes, keyBytes);

      // Convert the encrypted value to a base64 string
      const encrypted = Buffer.from(encryptedBytes).toString('base64');

      // Update the secret
      await octokit.actions.createOrUpdateEnvironmentSecret({
        owner,
        repo,
        environment_name: environment,
        secret_name: name,
        encrypted_value: encrypted,
        key_id: publicKeyData.key_id,
      });

      return this.findOneSecret(token, owner, repo, environment, name);
    } catch (error) {
      if (error.status === 404) {
        throw new NotFoundException(
          `Secret ${name} not found in environment ${environment} of repository ${owner}/${repo}`,
        );
      }
      throw error;
    }
  }

  /**
   * Delete a secret
   * @param token GitHub personal access token
   * @param owner Repository owner
   * @param repo Repository name
   * @param environment Environment name
   * @param name Secret name
   */
  async removeSecret(
    token: string,
    owner: string,
    repo: string,
    environment: string,
    name: string,
  ): Promise<void> {
    try {
      const octokit = this.githubService.createOctokitClient(token);
      await octokit.actions.deleteEnvironmentSecret({
        owner,
        repo,
        environment_name: environment,
        secret_name: name,
      });
    } catch (error) {
      if (error.status === 404) {
        throw new NotFoundException(
          `Secret ${name} not found in environment ${environment} of repository ${owner}/${repo}`,
        );
      }
      throw error;
    }
  }

  /**
   * Copy secrets from one environment to another
   * @param token GitHub personal access token
   * @param owner Repository owner
   * @param repo Repository name
   * @param sourceEnv Source environment name
   * @param targetEnv Target environment name
   * @param secretNames Optional list of secret names to copy (if empty, copy all)
   */
  async copySecrets(
    token: string,
    owner: string,
    repo: string,
    sourceEnv: string,
    targetEnv: string,
    secretNames?: string[],
  ): Promise<void> {
    // Get source secrets
    const sourceSecrets = await this.findAllSecrets(token, owner, repo, sourceEnv);

    if (sourceSecrets.length === 0) {
      throw new BadRequestException(`No secrets found in source environment ${sourceEnv}`);
    }

    // Filter secrets if names are provided
    const secretsToCopy = secretNames?.length
      ? sourceSecrets.filter(s => secretNames.includes(s.name))
      : sourceSecrets;

    if (secretNames?.length && secretsToCopy.length !== secretNames.length) {
      const missingSecrets = secretNames.filter(
        name => !sourceSecrets.some(s => s.name === name),
      );
      throw new NotFoundException(
        `Secrets not found in source environment: ${missingSecrets.join(', ')}`,
      );
    }

    const octokit = this.githubService.createOctokitClient(token);

    // Get the public key for the target environment
    const { data: publicKeyData } = await octokit.actions.getEnvironmentPublicKey({
      owner,
      repo,
      environment_name: targetEnv,
    });

    // For each secret in the source environment, get its value and create it in the target environment
    for (const secret of secretsToCopy) {
      try {
        // We can't get the actual value of a secret, so we need to prompt the user to provide it
        // In a real application, you would need to store the secret values securely
        // For this example, we'll just create a placeholder secret

        // Import the sodium library for encryption
        const sodium = require('libsodium-wrappers');

        // Ensure sodium is ready
        await sodium.ready;

        // Create a placeholder value (in a real app, you would use the actual secret value)
        const placeholderValue = `placeholder-for-${secret.name}`;

        // Convert the secret value to a Uint8Array
        const messageBytes = Buffer.from(placeholderValue);

        // Convert the public key to a Uint8Array
        const keyBytes = Buffer.from(publicKeyData.key, 'base64');

        // Encrypt the secret using the public key
        const encryptedBytes = sodium.crypto_box_seal(messageBytes, keyBytes);

        // Convert the encrypted value to a base64 string
        const encrypted = Buffer.from(encryptedBytes).toString('base64');

        // Create the secret in the target environment
        await octokit.actions.createOrUpdateEnvironmentSecret({
          owner,
          repo,
          environment_name: targetEnv,
          secret_name: secret.name,
          encrypted_value: encrypted,
          key_id: publicKeyData.key_id,
        });
      } catch (error) {
        throw error;
      }
    }
  }

  async copyVariables(
    token: string,
    owner: string,
    repo: string,
    sourceEnv: string,
    targetEnv: string,
    variableNames?: string[],
  ): Promise<void> {
    // Get source variables
    const sourceVariables = await this.findAll(token, owner, repo, sourceEnv);

    if (sourceVariables.length === 0) {
      throw new BadRequestException(`No variables found in source environment ${sourceEnv}`);
    }

    // Filter variables if names are provided
    const variablesToCopy = variableNames?.length
      ? sourceVariables.filter(v => variableNames.includes(v.name))
      : sourceVariables;

    if (variableNames?.length && variablesToCopy.length !== variableNames.length) {
      const missingVariables = variableNames.filter(
        name => !sourceVariables.some(v => v.name === name),
      );
      throw new NotFoundException(
        `Variables not found in source environment: ${missingVariables.join(', ')}`,
      );
    }

    // Copy each variable to target environment
    const octokit = this.githubService.createOctokitClient(token);

    for (const variable of variablesToCopy) {
      try {
        await octokit.actions.createEnvironmentVariable({
          owner,
          repo,
          environment_name: targetEnv,
          name: variable.name,
          value: variable.value,
        });
      } catch (error) {
        // If variable already exists, update it
        if (error.status === 422) {
          await octokit.actions.updateEnvironmentVariable({
            owner,
            repo,
            environment_name: targetEnv,
            name: variable.name,
            value: variable.value,
          });
        } else {
          throw error;
        }
      }
    }
  }
}
