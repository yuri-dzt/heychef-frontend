import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
export function PrivateRoute({ children }: {children: React.ReactNode;}) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center">
          <img src="/logo.svg" alt="HeyChef" className="w-16 h-16 mb-4" />
          <p className="text-text-secondary font-medium">
            Carregando HeyChef...
          </p>
        </div>
      </div>);

  }
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{
          from: location
        }}
        replace />);


  }
  return <>{children}</>;
}