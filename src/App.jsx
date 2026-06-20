import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/layout/Layout'
import CreatePermissionPage from './pages/CreatePermissionPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/create-permission" replace />} />
          <Route path="create-permission" element={<CreatePermissionPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
