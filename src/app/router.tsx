import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import { ProtectedRoute } from '../features/auth/components/ProtectedRoute'
import { RoleRoute } from '../features/auth/components/RoleRoute'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { PaudsPage } from '../features/admin/pages/PaudsPage'
import { RecalculationJobsPage } from '../features/admin/pages/RecalculationJobsPage'
import { WhoReferenceDataPage } from '../features/admin/pages/WhoReferenceDataPage'
import { AddMeasurementPage } from '../features/children/pages/AddMeasurementPage'
import { ChildListPage } from '../features/children/pages/ChildListPage'
import { ChildRegistrationPage } from '../features/children/pages/ChildRegistrationPage'
import { MeasurementHistoryPage } from '../features/children/pages/MeasurementHistoryPage'
import { DashboardPage } from '../features/dashboard/pages/DashboardPage'
import { GrowthResultsPage } from '../features/results/pages/GrowthResultsPage'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { NotFoundRoute } from './routePlaceholders'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/auth/sign-in" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route
              path="children"
              element={<ChildListPage />}
            />
            <Route
              path="children/register"
              element={<ChildRegistrationPage />}
            />
            <Route
              path="children/:childId/measurements"
              element={<MeasurementHistoryPage />}
            />
            <Route
              path="children/:childId/measurements/new"
              element={<AddMeasurementPage />}
            />
            <Route path="results" element={<GrowthResultsPage />} />
            <Route element={<RoleRoute allowedRoles={['super_admin']} />}>
              <Route path="admin/pauds" element={<PaudsPage />} />
              <Route
                path="admin/who-reference"
                element={<WhoReferenceDataPage />}
              />
              <Route
                path="admin/recalculations"
                element={<RecalculationJobsPage />}
              />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<NotFoundRoute />} />
      </Routes>
    </BrowserRouter>
  )
}
