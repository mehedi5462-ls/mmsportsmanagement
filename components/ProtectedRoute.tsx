import React from 'react';

interface Props { children: React.ReactNode; }

const ProtectedRoute: React.FC<Props> = ({ children }) => {
  // Production Note: Implement Firebase Auth listener here. 
  // For now, it bypasses to the main dashboard.
  return <>{children}</>;
};

export default ProtectedRoute;