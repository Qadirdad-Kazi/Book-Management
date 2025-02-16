import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [redirectPath, setRedirectPath] = useState('');
  
  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  useEffect(() => {
    if (!user || !user.token) {
      enqueueSnackbar('Please login to access this page', { variant: 'error' });
      setShouldRedirect(true);
      setRedirectPath('/login');
      return;
    }

    if (roles.length > 0 && !roles.includes(user.role)) {
      enqueueSnackbar('You do not have permission to access this page', { variant: 'error' });
      setShouldRedirect(true);
      setRedirectPath('/');
      return;
    }
  }, [user, roles, enqueueSnackbar]);

  if (shouldRedirect) {
    return <Navigate to={redirectPath} />;
  }

  // If we have a user and they have the required role (or no role is required)
  if (user && user.token && (!roles.length || roles.includes(user.role))) {
    return children;
  }

  // Show nothing while the effect is running
  return null;
};

export default ProtectedRoute;
