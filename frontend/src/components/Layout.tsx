import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Sidebar from './Sidebar'
import TopAppBar from './TopAppBar'
import BottomNav from './BottomNav'

export default function Layout() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      <Sidebar />
      <TopAppBar />
      <main className="md:ml-60 pt-16 md:pt-0 pb-20 md:pb-0">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
