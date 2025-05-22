'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const pathname = usePathname();

  if (!isAuthenticated || pathname === '/login') {
    return null;
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/repositories" className="font-semibold text-xl">
              GitHub Environment Variables
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link 
              href="/repositories" 
              className={`text-sm ${pathname.startsWith('/repositories') ? 'text-black font-medium' : 'text-gray-500 hover:text-black'}`}
            >
              Repositories
            </Link>
            
            <button 
              onClick={() => logout()} 
              className="text-sm text-gray-500 hover:text-black"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
