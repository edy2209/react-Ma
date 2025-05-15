import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element }) => {
  // cek local storage 
  const role = localStorage.getItem('role');
  const user = localStorage.getItem('user');

  console.log('Role:', role);
  console.log('User:', user);

  // null redirect ke login
  if (!role || !user || role === 'null' || user === 'null') {
    return <Navigate to="/" replace />;
  }

  
  return element;
};

export default ProtectedRoute;