import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: 'fa-th-large' },
  { to: '/crop-care', label: 'Crop Health', icon: 'fa-leaf' },
  { to: '/farmer-assistant', label: 'AI Assistant', icon: 'fa-robot' },
  { to: '/market-analysis', label: 'Market', icon: 'fa-chart-line' },
  { to: '/weather-advisory', label: 'Weather', icon: 'fa-cloud-sun' },
  { to: '/schemes', label: 'Schemes', icon: 'fa-landmark' },
  { to: '/equipment-rental', label: 'Equipment', icon: 'fa-tractor' },
  { to: '/waste-exchange', label: 'Waste Exchange', icon: 'fa-recycle' },
  { to: '/education', label: 'Education', icon: 'fa-graduation-cap' },
  { to: '/community', label: 'Community', icon: 'fa-users' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="bg-[#0a1f0d] border-b border-[#2d4a32] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 text-white no-underline">
            <i className="fas fa-seedling text-[#4ade80] text-xl"></i>
            <span className="font-bold text-lg">Kissan Mitra</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-lg text-sm no-underline transition-colors ${
                  location.pathname === link.to
                    ? 'bg-[#166534] text-white'
                    : 'text-gray-300 hover:bg-[#1a2e1d] hover:text-white'
                }`}
              >
                <i className={`fas ${link.icon} mr-1`}></i>
                {link.label}
              </Link>
            ))}
          </div>

          {/* User area */}
          <div className="flex items-center gap-3">
            {user && (
              <span className="hidden sm:block text-sm text-gray-300">
                <i className="fas fa-user mr-1"></i>
                {user.name}
              </span>
            )}
            <button
              onClick={logout}
              className="text-sm text-gray-300 hover:text-red-400 transition-colors bg-transparent border-none cursor-pointer"
            >
              <i className="fas fa-sign-out-alt mr-1"></i>
              <span className="hidden sm:inline">Logout</span>
            </button>
            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden text-white bg-transparent border-none cursor-pointer text-xl"
            >
              <i className={`fas ${menuOpen ? 'fa-times' : 'fa-bars'}`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-[#0a1f0d] border-t border-[#2d4a32] py-2">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={`block px-4 py-2.5 text-sm no-underline ${
                location.pathname === link.to
                  ? 'bg-[#166534] text-white'
                  : 'text-gray-300 hover:bg-[#1a2e1d]'
              }`}
            >
              <i className={`fas ${link.icon} mr-2`}></i>
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
