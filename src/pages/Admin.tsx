import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useAdminActions';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { Header } from '@/components/Header';

export const Admin = () => {
  const { data: userRole, isLoading } = useUserRole();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Chargement...</div>
        </div>
      </div>
    );
  }

  if (userRole !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <AdminPanel />
        </div>
      </div>
    </div>
  );
};