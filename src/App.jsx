import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Layout from './components/layout/Layout'
import { AuthProvider } from './context/AuthContext'
import CreatePermissionPage from './pages/CreatePermissionPage'
import LoginPage from './pages/LoginPage'
import RoleManagementPage from './pages/RoleManagementPage'
import RolePermissionsPage from './pages/RolePermissionsPage'
import UserManagementPage from './pages/UserManagementPage'
import RoleBundleManagementPage from './pages/RoleBundleManagementPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route index element={<Navigate to="/create-permission" replace />} />
              <Route path="create-permission" element={<CreatePermissionPage />} />
              <Route path="role-management" element={<RoleManagementPage />} />
              <Route path="role-management/:roleId/permissions" element={<RolePermissionsPage />} />
              <Route path="user-management" element={<UserManagementPage />} />
              <Route path="role-bundle-management" element={<RoleBundleManagementPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
