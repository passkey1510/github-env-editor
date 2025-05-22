'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { apiClient, Variable, Secret } from '@/lib/api-client';
import toast from 'react-hot-toast';

export default function VariablesPage() {
  const params = useParams();
  const owner = params.owner as string;
  const repo = params.repo as string;
  const environment = params.environment as string;

  // Tab state
  const [activeTab, setActiveTab] = useState<'variables' | 'secrets'>('variables');

  // Variables state
  const [variables, setVariables] = useState<Variable[]>([]);
  const [isLoadingVariables, setIsLoadingVariables] = useState(true);
  const [newVariable, setNewVariable] = useState({ name: '', value: '' });
  const [isCreatingVariable, setIsCreatingVariable] = useState(false);
  const [editingVariable, setEditingVariable] = useState<{ name: string; value: string } | null>(null);
  const [isEditingVariable, setIsEditingVariable] = useState(false);
  const [showVariableValues, setShowVariableValues] = useState<Record<string, boolean>>({});
  const [variableCloneTarget, setVariableCloneTarget] = useState('');
  const [isCloningVariables, setIsCloningVariables] = useState(false);

  // Secrets state
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [isLoadingSecrets, setIsLoadingSecrets] = useState(true);
  const [newSecret, setNewSecret] = useState({ name: '', value: '' });
  const [isCreatingSecret, setIsCreatingSecret] = useState(false);
  const [editingSecret, setEditingSecret] = useState<{ name: string; value: string } | null>(null);
  const [isEditingSecret, setIsEditingSecret] = useState(false);
  const [secretCloneTarget, setSecretCloneTarget] = useState('');
  const [isCloningSecrets, setIsCloningSecrets] = useState(false);

  useEffect(() => {
    const fetchVariables = async () => {
      try {
        const vars = await apiClient.getVariables(owner, repo, environment);
        setVariables(vars);
      } catch (error) {
        console.error('Error fetching variables:', error);
        toast.error('Failed to load variables');
      } finally {
        setIsLoadingVariables(false);
      }
    };

    const fetchSecrets = async () => {
      try {
        const secretsData = await apiClient.getSecrets(owner, repo, environment);
        setSecrets(secretsData);
      } catch (error) {
        console.error('Error fetching secrets:', error);
        toast.error('Failed to load secrets');
      } finally {
        setIsLoadingSecrets(false);
      }
    };

    fetchVariables();
    fetchSecrets();
  }, [owner, repo, environment]);

  const handleCreateVariable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVariable.name.trim() || !newVariable.value.trim()) return;

    setIsCreatingVariable(true);
    try {
      const createdVar = await apiClient.createVariable(
        owner,
        repo,
        environment,
        newVariable.name,
        newVariable.value
      );
      setVariables([...variables, createdVar]);
      setNewVariable({ name: '', value: '' });
      toast.success(`Variable "${newVariable.name}" created successfully`);
    } catch (error) {
      console.error('Error creating variable:', error);
      toast.error('Failed to create variable');
    } finally {
      setIsCreatingVariable(false);
    }
  };

  const handleUpdateVariable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVariable) return;

    setIsEditingVariable(true);
    try {
      const updatedVar = await apiClient.updateVariable(
        owner,
        repo,
        environment,
        editingVariable.name,
        editingVariable.value
      );

      setVariables(variables.map(v =>
        v.name === editingVariable.name ? updatedVar : v
      ));

      setEditingVariable(null);
      toast.success(`Variable "${editingVariable.name}" updated successfully`);
    } catch (error) {
      console.error('Error updating variable:', error);
      toast.error('Failed to update variable');
    } finally {
      setIsEditingVariable(false);
    }
  };

  const handleDeleteVariable = async (name: string) => {
    if (!confirm(`Are you sure you want to delete the variable "${name}"?`)) {
      return;
    }

    try {
      await apiClient.deleteVariable(owner, repo, environment, name);
      setVariables(variables.filter(v => v.name !== name));
      toast.success(`Variable "${name}" deleted successfully`);
    } catch (error) {
      console.error('Error deleting variable:', error);
      toast.error('Failed to delete variable');
    }
  };

  const handleCloneVariables = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!variableCloneTarget.trim()) return;

    setIsCloningVariables(true);
    try {
      await apiClient.copyVariables(owner, repo, environment, variableCloneTarget);
      toast.success(`Variables cloned to "${variableCloneTarget}" successfully`);
      setVariableCloneTarget('');
    } catch (error) {
      console.error('Error cloning variables:', error);
      toast.error('Failed to clone variables');
    } finally {
      setIsCloningVariables(false);
    }
  };

  const toggleShowVariableValue = (name: string) => {
    setShowVariableValues(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  // Secret handlers
  const handleCreateSecret = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSecret.name.trim() || !newSecret.value.trim()) return;

    setIsCreatingSecret(true);
    try {
      const createdSecret = await apiClient.createSecret(
        owner,
        repo,
        environment,
        newSecret.name,
        newSecret.value
      );
      setSecrets([...secrets, createdSecret]);
      setNewSecret({ name: '', value: '' });
      toast.success(`Secret "${newSecret.name}" created successfully`);
    } catch (error) {
      console.error('Error creating secret:', error);
      toast.error('Failed to create secret');
    } finally {
      setIsCreatingSecret(false);
    }
  };

  const handleUpdateSecret = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSecret) return;

    setIsEditingSecret(true);
    try {
      const updatedSecret = await apiClient.updateSecret(
        owner,
        repo,
        environment,
        editingSecret.name,
        editingSecret.value
      );

      setSecrets(secrets.map(s =>
        s.name === editingSecret.name ? updatedSecret : s
      ));

      setEditingSecret(null);
      toast.success(`Secret "${editingSecret.name}" updated successfully`);
    } catch (error) {
      console.error('Error updating secret:', error);
      toast.error('Failed to update secret');
    } finally {
      setIsEditingSecret(false);
    }
  };

  const handleDeleteSecret = async (name: string) => {
    if (!confirm(`Are you sure you want to delete the secret "${name}"?`)) {
      return;
    }

    try {
      await apiClient.deleteSecret(owner, repo, environment, name);
      setSecrets(secrets.filter(s => s.name !== name));
      toast.success(`Secret "${name}" deleted successfully`);
    } catch (error) {
      console.error('Error deleting secret:', error);
      toast.error('Failed to delete secret');
    }
  };

  const handleCloneSecrets = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretCloneTarget.trim()) return;

    setIsCloningSecrets(true);
    try {
      await apiClient.copySecrets(owner, repo, environment, secretCloneTarget);
      toast.success(`Secrets cloned to "${secretCloneTarget}" successfully`);
      setSecretCloneTarget('');
    } catch (error) {
      console.error('Error cloning secrets:', error);
      toast.error('Failed to clone secrets');
    } finally {
      setIsCloningSecrets(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center text-sm text-gray-500 mb-2 flex-wrap">
          <Link href="/repositories" className="hover:text-gray-700">Repositories</Link>
          <span className="mx-2">/</span>
          <Link href={`/repositories/${owner}/${repo}/environments`} className="hover:text-gray-700">{owner}/{repo}</Link>
          <span className="mx-2">/</span>
          <span className="font-medium text-gray-900">{environment}</span>
        </div>
        <h1 className="text-2xl font-bold">Environment Configuration</h1>
      </div>

      {/* Tabs */}
      <div className="mb-8 border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('variables')}
            className={`py-4 px-6 text-sm font-medium ${
              activeTab === 'variables'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Variables
          </button>
          <button
            onClick={() => setActiveTab('secrets')}
            className={`py-4 px-6 text-sm font-medium ${
              activeTab === 'secrets'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Secrets
          </button>
        </nav>
      </div>

      {/* Variables Tab */}
      {activeTab === 'variables' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-lg font-medium mb-4">Add New Variable</h2>
              <form onSubmit={handleCreateVariable} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Variable name"
                    value={newVariable.name}
                    onChange={(e) => setNewVariable({ ...newVariable, name: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-md"
                    disabled={isCreatingVariable}
                  />
                  <input
                    type="text"
                    placeholder="Variable value"
                    value={newVariable.value}
                    onChange={(e) => setNewVariable({ ...newVariable, value: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-md"
                    disabled={isCreatingVariable}
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  disabled={!newVariable.name.trim() || !newVariable.value.trim() || isCreatingVariable}
                >
                  {isCreatingVariable ? 'Adding...' : 'Add Variable'}
                </button>
              </form>
            </div>

            <div>
              <h2 className="text-lg font-medium mb-4">Clone to Another Environment</h2>
              <form onSubmit={handleCloneVariables} className="space-y-4">
                <input
                  type="text"
                  placeholder="Target environment name"
                  value={variableCloneTarget}
                  onChange={(e) => setVariableCloneTarget(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  disabled={isCloningVariables}
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  disabled={!variableCloneTarget.trim() || isCloningVariables}
                >
                  {isCloningVariables ? 'Cloning...' : 'Clone Variables'}
                </button>
              </form>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-medium mb-4">Variables</h2>

            {isLoadingVariables ? (
              <div className="flex justify-center items-center h-64">
                <p className="text-gray-500">Loading variables...</p>
              </div>
            ) : variables.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-700 mb-2">No variables found for this environment.</p>
                <p className="text-gray-500">Add your first variable using the form above.</p>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                {variables.map((variable, index) => (
                  <div
                    key={variable.name}
                    className={`p-4 ${index !== variables.length - 1 ? 'border-b border-gray-200' : ''}`}
                  >
                    {editingVariable && editingVariable.name === variable.name ? (
                      <form onSubmit={handleUpdateVariable} className="grid grid-cols-1 md:grid-cols-[1fr,2fr,auto] gap-4 items-center">
                        <div className="font-mono text-sm font-medium">{variable.name}</div>
                        <input
                          type="text"
                          value={editingVariable.value}
                          onChange={(e) => setEditingVariable({ ...editingVariable, value: e.target.value })}
                          className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-mono"
                          disabled={isEditingVariable}
                        />
                        <div className="flex space-x-2">
                          <button
                            type="submit"
                            className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded hover:bg-green-200 disabled:opacity-50"
                            disabled={isEditingVariable}
                          >
                            {isEditingVariable ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            type="button"
                            className="px-3 py-1 bg-gray-100 text-gray-800 text-xs rounded hover:bg-gray-200 disabled:opacity-50"
                            onClick={() => setEditingVariable(null)}
                            disabled={isEditingVariable}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-[1fr,2fr,auto] gap-4 items-center">
                        <div className="font-mono text-sm font-medium">{variable.name}</div>
                        <div className="font-mono text-sm text-gray-600 flex items-center">
                          {showVariableValues[variable.name] ? (
                            variable.value
                          ) : (
                            '••••••••••••••••'
                          )}
                          <button
                            className="ml-2 px-2 py-0.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                            onClick={() => toggleShowVariableValue(variable.name)}
                          >
                            {showVariableValues[variable.name] ? 'Hide' : 'Show'}
                          </button>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded hover:bg-blue-200"
                            onClick={() => setEditingVariable({ name: variable.name, value: variable.value })}
                          >
                            Edit
                          </button>
                          <button
                            className="px-3 py-1 bg-red-100 text-red-800 text-xs rounded hover:bg-red-200"
                            onClick={() => handleDeleteVariable(variable.name)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Secrets Tab */}
      {activeTab === 'secrets' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-lg font-medium mb-4">Add New Secret</h2>
              <form onSubmit={handleCreateSecret} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Secret name"
                    value={newSecret.name}
                    onChange={(e) => setNewSecret({ ...newSecret, name: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-md"
                    disabled={isCreatingSecret}
                  />
                  <input
                    type="password"
                    placeholder="Secret value"
                    value={newSecret.value}
                    onChange={(e) => setNewSecret({ ...newSecret, value: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-md"
                    disabled={isCreatingSecret}
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  disabled={!newSecret.name.trim() || !newSecret.value.trim() || isCreatingSecret}
                >
                  {isCreatingSecret ? 'Adding...' : 'Add Secret'}
                </button>
              </form>
            </div>

            <div>
              <h2 className="text-lg font-medium mb-4">Clone to Another Environment</h2>
              <form onSubmit={handleCloneSecrets} className="space-y-4">
                <input
                  type="text"
                  placeholder="Target environment name"
                  value={secretCloneTarget}
                  onChange={(e) => setSecretCloneTarget(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  disabled={isCloningSecrets}
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  disabled={!secretCloneTarget.trim() || isCloningSecrets}
                >
                  {isCloningSecrets ? 'Cloning...' : 'Clone Secrets'}
                </button>
              </form>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-medium mb-4">Secrets</h2>

            {isLoadingSecrets ? (
              <div className="flex justify-center items-center h-64">
                <p className="text-gray-500">Loading secrets...</p>
              </div>
            ) : secrets.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-700 mb-2">No secrets found for this environment.</p>
                <p className="text-gray-500">Add your first secret using the form above.</p>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                {secrets.map((secret, index) => (
                  <div
                    key={secret.name}
                    className={`p-4 ${index !== secrets.length - 1 ? 'border-b border-gray-200' : ''}`}
                  >
                    {editingSecret && editingSecret.name === secret.name ? (
                      <form onSubmit={handleUpdateSecret} className="grid grid-cols-1 md:grid-cols-[1fr,2fr,auto] gap-4 items-center">
                        <div className="font-mono text-sm font-medium">{secret.name}</div>
                        <input
                          type="password"
                          value={editingSecret.value}
                          onChange={(e) => setEditingSecret({ ...editingSecret, value: e.target.value })}
                          className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-mono"
                          disabled={isEditingSecret}
                        />
                        <div className="flex space-x-2">
                          <button
                            type="submit"
                            className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded hover:bg-green-200 disabled:opacity-50"
                            disabled={isEditingSecret}
                          >
                            {isEditingSecret ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            type="button"
                            className="px-3 py-1 bg-gray-100 text-gray-800 text-xs rounded hover:bg-gray-200 disabled:opacity-50"
                            onClick={() => setEditingSecret(null)}
                            disabled={isEditingSecret}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-[1fr,2fr,auto] gap-4 items-center">
                        <div className="font-mono text-sm font-medium">{secret.name}</div>
                        <div className="font-mono text-sm text-gray-600">
                          <span className="text-gray-500 italic">
                            [Secret value hidden]
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded hover:bg-blue-200"
                            onClick={() => setEditingSecret({ name: secret.name, value: '' })}
                          >
                            Update
                          </button>
                          <button
                            className="px-3 py-1 bg-red-100 text-red-800 text-xs rounded hover:bg-red-200"
                            onClick={() => handleDeleteSecret(secret.name)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
