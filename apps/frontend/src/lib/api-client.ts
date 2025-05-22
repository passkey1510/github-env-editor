import axios, { AxiosInstance } from 'axios';

// Define the base types for our API
export interface Repository {
  id: number;
  name: string;
  owner: {
    login: string;
  };
  full_name: string;
  description: string | null;
  html_url: string;
  private: boolean;
}

export interface Environment {
  name: string;
  url: string;
  html_url: string;
  created_at: string;
  updated_at: string;
}

export interface Variable {
  name: string;
  value: string;
  created_at: string;
  updated_at: string;
}

export interface Secret {
  name: string;
  created_at: string;
  updated_at: string;
}

// Create API client class
export class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor(baseURL: string = 'http://localhost:3001/api') {
    this.client = axios.create({
      baseURL,
    });
  }

  setToken(token: string) {
    this.token = token;
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  clearToken() {
    this.token = null;
    delete this.client.defaults.headers.common['Authorization'];
  }

  // Repository endpoints
  async getRepositories(): Promise<Repository[]> {
    const response = await this.client.get('/repositories');
    return response.data;
  }

  async getRepository(owner: string, repo: string): Promise<Repository> {
    const response = await this.client.get(`/repositories/${owner}/${repo}`);
    return response.data;
  }

  // Environment endpoints
  async getEnvironments(owner: string, repo: string): Promise<Environment[]> {
    const response = await this.client.get(`/repositories/${owner}/${repo}/environments`);
    return response.data;
  }

  async getEnvironment(owner: string, repo: string, name: string): Promise<Environment> {
    const response = await this.client.get(`/repositories/${owner}/${repo}/environments/${name}`);
    return response.data;
  }

  async createEnvironment(owner: string, repo: string, name: string): Promise<Environment> {
    const response = await this.client.post(`/repositories/${owner}/${repo}/environments`, { name });
    return response.data;
  }

  async deleteEnvironment(owner: string, repo: string, name: string): Promise<void> {
    await this.client.delete(`/repositories/${owner}/${repo}/environments/${name}`);
  }

  async cloneEnvironment(
    owner: string,
    repo: string,
    sourceEnv: string,
    targetEnv: string
  ): Promise<Environment> {
    const response = await this.client.post(
      `/repositories/${owner}/${repo}/environments/${sourceEnv}/clone`,
      { targetEnvironment: targetEnv }
    );
    return response.data;
  }

  // Variable endpoints
  async getVariables(owner: string, repo: string, environment: string): Promise<Variable[]> {
    const response = await this.client.get(
      `/repositories/${owner}/${repo}/environments/${environment}/variables`
    );
    return response.data;
  }

  async getVariable(
    owner: string,
    repo: string,
    environment: string,
    name: string
  ): Promise<Variable> {
    const response = await this.client.get(
      `/repositories/${owner}/${repo}/environments/${environment}/variables/${name}`
    );
    return response.data;
  }

  async createVariable(
    owner: string,
    repo: string,
    environment: string,
    name: string,
    value: string
  ): Promise<Variable> {
    const response = await this.client.post(
      `/repositories/${owner}/${repo}/environments/${environment}/variables`,
      { name, value }
    );
    return response.data;
  }

  async updateVariable(
    owner: string,
    repo: string,
    environment: string,
    name: string,
    value: string
  ): Promise<Variable> {
    const response = await this.client.put(
      `/repositories/${owner}/${repo}/environments/${environment}/variables/${name}`,
      { value }
    );
    return response.data;
  }

  async deleteVariable(
    owner: string,
    repo: string,
    environment: string,
    name: string
  ): Promise<void> {
    await this.client.delete(
      `/repositories/${owner}/${repo}/environments/${environment}/variables/${name}`
    );
  }

  async copyVariables(
    owner: string,
    repo: string,
    sourceEnv: string,
    targetEnv: string,
    variables?: string[]
  ): Promise<void> {
    await this.client.post(
      `/repositories/${owner}/${repo}/environments/${sourceEnv}/variables/copy`,
      { targetEnvironment: targetEnv, variables }
    );
  }

  async copyVariablesToRepo(
    sourceOwner: string,
    sourceRepo: string,
    sourceEnv: string,
    targetOwner: string,
    targetRepo: string,
    targetEnv: string,
    variables?: string[]
  ): Promise<void> {
    await this.client.post(
      `/repositories/${sourceOwner}/${sourceRepo}/environments/${sourceEnv}/variables/copy-to-repo`,
      { targetOwner, targetRepo, targetEnvironment: targetEnv, variables }
    );
  }

  // Secret endpoints
  async getSecrets(owner: string, repo: string, environment: string): Promise<Secret[]> {
    const response = await this.client.get(
      `/repositories/${owner}/${repo}/environments/${environment}/secrets`
    );
    return response.data;
  }

  async getSecret(
    owner: string,
    repo: string,
    environment: string,
    name: string
  ): Promise<Secret> {
    const response = await this.client.get(
      `/repositories/${owner}/${repo}/environments/${environment}/secrets/${name}`
    );
    return response.data;
  }

  async createSecret(
    owner: string,
    repo: string,
    environment: string,
    name: string,
    value: string
  ): Promise<Secret> {
    const response = await this.client.post(
      `/repositories/${owner}/${repo}/environments/${environment}/secrets`,
      { name, value }
    );
    return response.data;
  }

  async updateSecret(
    owner: string,
    repo: string,
    environment: string,
    name: string,
    value: string
  ): Promise<Secret> {
    const response = await this.client.put(
      `/repositories/${owner}/${repo}/environments/${environment}/secrets/${name}`,
      { value }
    );
    return response.data;
  }

  async deleteSecret(
    owner: string,
    repo: string,
    environment: string,
    name: string
  ): Promise<void> {
    await this.client.delete(
      `/repositories/${owner}/${repo}/environments/${environment}/secrets/${name}`
    );
  }

  async copySecrets(
    owner: string,
    repo: string,
    sourceEnv: string,
    targetEnv: string,
    secrets?: string[]
  ): Promise<void> {
    await this.client.post(
      `/repositories/${owner}/${repo}/environments/${sourceEnv}/secrets/copy`,
      { targetEnvironment: targetEnv, secrets }
    );
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();
