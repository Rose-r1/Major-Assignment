import { Navigate } from 'react-router-dom';

export default function RoleRoute({ allowRoles, children }) {
  const role = localStorage.getItem('role');

  if (!allowRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}