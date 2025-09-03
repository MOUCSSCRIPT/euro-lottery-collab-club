import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useAdminActions';

const Groups = () => {
  const { data: userRole } = useUserRole();
  
  // Redirect admins to admin panel, others to games
  if (userRole === 'admin') {
    return <Navigate to="/admin?tab=loto-foot" replace />;
  }
  return <Navigate to="/games" replace />;
};

export default Groups;