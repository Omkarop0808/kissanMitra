import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LayoutDashboard, Leaf, Bot, CloudSun, Heart } from 'lucide-react'

const tabs = [
  { to: '/dashboard', icon: LayoutDashboard, key: 'nav.dashboard' },
  { to: '/crop-care', icon: Leaf, key: 'nav.cropHealth' },
  { to: '/farmer-assistant', icon: Bot, key: 'nav.aiAssistant' },
  { to: '/weather-advisory', icon: CloudSun, key: 'nav.weather' },
  { to: '/donation', icon: Heart, key: 'nav.donation' },
]

export default function BottomNav() {
  const location = useLocation()
  const { t } = useTranslation()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[var(--color-outline-variant)] flex items-center justify-around z-40">
      {tabs.map(tab => {
        const active = location.pathname === tab.to
        const Icon = tab.icon
        return (
          <Link
            key={tab.to}
            to={tab.to}
            className="flex flex-col items-center gap-0.5 no-underline px-3 py-1"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${active ? 'bg-[var(--color-primary-container)]' : ''}`}>
              <Icon size={20} className={active ? 'text-[var(--color-primary)]' : 'text-[var(--color-on-surface-variant)]'} />
            </div>
            <span className={`text-[10px] font-medium ${active ? 'text-[var(--color-primary)]' : 'text-[var(--color-on-surface-variant)]'}`}>
              {t(tab.key)}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
