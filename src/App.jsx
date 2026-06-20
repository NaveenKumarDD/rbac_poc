import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/layout/Layout'
import CreatePermissionPage from './pages/CreatePermissionPage'
import RoleManagementPage from './pages/RoleManagementPage'
import RolePermissionsPage from './pages/RolePermissionsPage'
import RoleBundleManagementPage from './pages/RoleBundleManagementPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/create-permission" replace />} />
          <Route path="create-permission" element={<CreatePermissionPage />} />
          <Route path="role-management" element={<RoleManagementPage />} />
          <Route path="role-management/:roleId/permissions" element={<RolePermissionsPage />} />
          <Route path="role-bundle-management" element={<RoleBundleManagementPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
