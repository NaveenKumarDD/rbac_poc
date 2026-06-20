import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'

export default function Layout() {
  return (
    <div className="flex h-screen flex-col bg-slate-50">
      <Header />

      <div className="flex min-h-0 flex-1">
        <Sidebar />

        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
