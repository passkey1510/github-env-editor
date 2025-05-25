'use client';

import ProtectedRoute from '@/components/protected-route';
import Navbar from '@/components/navbar';

export default function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col gradient-secondary relative">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gradient-to-br from-blue-400/10 to-purple-600/10 blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-gradient-to-tr from-purple-400/10 to-pink-600/10 blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        </div>

        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
