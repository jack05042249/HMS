import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoutes = ({ children }) => {
  const { user } = useSelector((state) => state);

  if (user.type === "admin") {
    return children;
  } else {
    return <Navigate to="/talents-layout" />;
  }
};

export default ProtectedRoutes;
