import { Navigate, Outlet } from 'react-router-dom'

import { useAuthStore } from '../store/authStore'

export function RoleRoute({ allowedRoles }: { allowedRoles: string[] }) {
  const role = useAuthStore((state) => state.user?.role ?? 'paud_admin')

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
