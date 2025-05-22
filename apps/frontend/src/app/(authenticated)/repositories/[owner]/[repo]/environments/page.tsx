'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { apiClient, Environment, Repository } from '@/lib/api-client';
import toast from 'react-hot-toast';

export default function EnvironmentsPage() {
  const params = useParams();
  const owner = params.owner as string;
  const repo = params.repo as string;

  const [repository, setRepository] = useState<Repository | null>(null);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newEnvironmentName, setNewEnvironmentName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [repoData, envsData] = await Promise.all([
          apiClient.getRepository(owner, repo),
          apiClient.getEnvironments(owner, repo)
        ]);
        setRepository(repoData);
        setEnvironments(envsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load repository data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [owner, repo]);

  const handleCreateEnvironment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEnvironmentName.trim()) return;

    setIsCreating(true);
    try {
      const newEnv = await apiClient.createEnvironment(owner, repo, newEnvironmentName);
      setEnvironments([...environments, newEnv]);
      setNewEnvironmentName('');
      toast.success(`Environment "${newEnvironmentName}" created successfully`);
    } catch (error) {
      console.error('Error creating environment:', error);
      toast.error('Failed to create environment');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <Link href="/repositories" className="hover:text-gray-700">Repositories</Link>
          <span className="mx-2">/</span>
          <span className="font-medium text-gray-900">{owner}/{repo}</span>
        </div>
        <h1 className="text-2xl font-bold">Environments</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading environments...</p>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <form onSubmit={handleCreateEnvironment} className="flex flex-col sm:flex-row gap-4 max-w-lg">
              <input
                type="text"
                placeholder="New environment name"
                value={newEnvironmentName}
                onChange={(e) => setNewEnvironmentName(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md"
                disabled={isCreating}
              />
              <button 
                type="submit" 
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                disabled={!newEnvironmentName.trim() || isCreating}
              >
                {isCreating ? 'Creating...' : 'Create Environment'}
              </button>
            </form>
          </div>

          {environments.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-700 mb-2">No environments found for this repository.</p>
              <p className="text-gray-500">Create your first environment using the form above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {environments.map((env) => (
                <Link
                  key={env.name}
                  href={`/repositories/${owner}/${repo}/environments/${env.name}/variables`}
                  className="block p-6 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow transition-all"
                >
                  <h2 className="text-lg font-semibold mb-4">{env.name}</h2>
                  <div className="text-xs text-gray-500">
                    Created: {new Date(env.created_at).toLocaleDateString()}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
