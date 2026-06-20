import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/layout/Layout'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<div className="p-6 text-sm text-slate-500">Qsuite Access Control Portal</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
