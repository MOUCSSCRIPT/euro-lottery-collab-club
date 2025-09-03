import React from 'react';
import { Navigate } from 'react-router-dom';

const Groups = () => {
  // Redirect all users to games page
  return <Navigate to="/games" replace />;
};

export default Groups;