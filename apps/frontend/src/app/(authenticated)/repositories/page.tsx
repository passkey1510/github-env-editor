'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient, Repository } from '@/lib/api-client';
import toast from 'react-hot-toast';

export default function RepositoriesPage() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        const repos = await apiClient.getRepositories();
        setRepositories(repos);
      } catch (error) {
        console.error('Error fetching repositories:', error);
        toast.error('Failed to load repositories');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRepositories();
  }, []);

  const filteredRepositories = repositories.filter(repo => 
    repo.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-2xl font-bold">Your Repositories</h1>
        <div className="w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search repositories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading repositories...</p>
        </div>
      ) : filteredRepositories.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          {searchQuery ? (
            <p className="text-gray-500">No repositories found matching "{searchQuery}"</p>
          ) : (
            <p className="text-gray-500">No repositories found. Make sure your GitHub token has the correct permissions.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRepositories.map((repo) => (
            <Link
              key={repo.id}
              href={`/repositories/${repo.owner.login}/${repo.name}/environments`}
              className="block p-6 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow transition-all"
            >
              <h2 className="text-lg font-semibold">{repo.name}</h2>
              <p className="text-sm text-gray-500 mb-2">{repo.owner.login}</p>
              {repo.description && (
                <p className="text-sm text-gray-700 mb-4 line-clamp-2">{repo.description}</p>
              )}
              <div className="mt-auto">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  repo.private 
                    ? 'bg-amber-100 text-amber-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {repo.private ? 'Private' : 'Public'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
