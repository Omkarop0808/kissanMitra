import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Leaf, Bot, TrendingUp, CloudSun, Droplets,
  Landmark, Tractor, Recycle, GraduationCap, Users, Heart, LogOut,
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/crop-care', icon: Leaf, label: 'Crop Health' },
  { to: '/farmer-assistant', icon: Bot, label: 'AI Assistant' },
  { to: '/market-analysis', icon: TrendingUp, label: 'Market Prices' },
  { to: '/weather-advisory', icon: CloudSun, label: 'Weather' },
  { to: '/water-footprint', icon: Droplets, label: 'Water Footprint' },
  { to: '/schemes', icon: Landmark, label: 'Gov. Schemes' },
  { to: '/equipment-rental', icon: Tractor, label: 'Equipment' },
  { to: '/waste-exchange', icon: Recycle, label: 'Waste Exchange' },
  { to: '/education', icon: GraduationCap, label: 'Education' },
  { to: '/community', icon: Users, label: 'Community' },
  { to: '/donation', icon: Heart, label: 'Support' },
]

export default function Sidebar() {
  const location = useLocation()
  const { user, logout } = useAuth()

  return (
    <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-60 bg-white border-r border-[var(--color-outline-variant)] flex-col z-40">
      {/* Logo */}
      <Link to="/dashboard" className="flex items-center gap-3 px-5 py-5 no-underline border-b border-[var(--color-outline-variant)]">
        <div className="w-10 h-10 rounded-2xl bg-[var(--color-primary)] flex items-center justify-center">
          <span className="text-white text-lg font-bold">KM</span>
        </div>
        <div>
          <p className="font-bold text-[var(--color-on-surface)] text-base leading-tight">Kissan Mitra</p>
          <p className="text-[var(--color-on-surface-variant)] text-xs">Smart Farming</p>
        </div>
      </Link>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto py-2 px-3">
        {navItems.map(item => {
          const active = location.pathname === item.to
          const Icon = item.icon
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 no-underline text-sm font-medium transition-colors ${
                active
                  ? 'bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]'
                  : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-variant)]'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-[var(--color-outline-variant)] p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-[var(--color-primary-container)] flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold text-[var(--color-on-primary-container)]">
              {user?.name?.charAt(0)?.toUpperCase() || 'F'}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[var(--color-on-surface)] truncate">{user?.name || 'Farmer'}</p>
            <p className="text-xs text-[var(--color-on-surface-variant)] truncate">{user?.email || ''}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm font-medium text-[var(--color-error)] hover:bg-[var(--color-error-container)] transition-colors bg-transparent border-none cursor-pointer"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
