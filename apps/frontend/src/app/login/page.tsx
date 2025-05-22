'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/auth-context';
import { apiClient } from '@/lib/api-client';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  token: z.string().min(1, 'GitHub token is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      // Set the token temporarily to validate it
      apiClient.setToken(data.token);
      
      // Try to fetch repositories to validate the token
      await apiClient.getRepositories();
      
      // If successful, login and redirect
      login(data.token);
      toast.success('Successfully logged in');
      router.push('/repositories');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Invalid GitHub token. Please check and try again.');
      // Clear the temporary token
      apiClient.clearToken();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h1 className="text-2xl font-bold">GitHub Environment Variables</h1>
          <p className="mt-2 text-gray-600">
            Enter your GitHub personal access token to manage repository environment variables.
          </p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div>
            <label htmlFor="token" className="block text-sm font-medium text-gray-700">
              GitHub Personal Access Token
            </label>
            <input
              id="token"
              type="password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              {...register('token')}
              disabled={isLoading}
            />
            {errors.token && (
              <p className="mt-1 text-sm text-red-600">{errors.token.message}</p>
            )}
          </div>
          
          <button 
            type="submit" 
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="mt-6 border-t border-gray-200 pt-6">
          <h3 className="text-sm font-medium text-gray-700">How to get a GitHub token:</h3>
          <ol className="mt-2 text-sm text-gray-600 list-decimal pl-5 space-y-1">
            <li>Go to your GitHub Settings &gt; Developer settings &gt; Personal access tokens</li>
            <li>Click "Generate new token" (classic)</li>
            <li>Give it a name and select the <code className="px-1 py-0.5 bg-gray-100 rounded text-xs">repo</code> scope</li>
            <li>Click "Generate token" and copy the token</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
