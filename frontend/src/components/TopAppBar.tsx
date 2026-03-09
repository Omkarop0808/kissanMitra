import { Menu } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import LanguageSwitcher from './LanguageSwitcher'

interface TopAppBarProps {
  onMenuClick?: () => void
}

export default function TopAppBar({ onMenuClick }: TopAppBarProps) {
  const { user } = useAuth()
  const { t } = useTranslation()

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-[var(--color-outline-variant)] flex items-center justify-between px-4 z-40">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button onClick={onMenuClick} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[var(--color-surface-variant)] transition-colors bg-transparent border-none cursor-pointer">
            <Menu size={24} className="text-[var(--color-on-surface)]" />
          </button>
        )}
        <Link to="/dashboard" className="flex items-center gap-2 no-underline">
          <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
            <span className="text-white text-sm font-bold">KM</span>
          </div>
          <span className="font-bold text-[var(--color-on-surface)]">{t('app.name')}</span>
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <LanguageSwitcher mode="icon" />
        {user && (
          <div className="w-9 h-9 rounded-full bg-[var(--color-primary-container)] flex items-center justify-center">
            <span className="text-sm font-semibold text-[var(--color-on-primary-container)]">
              {user.name?.charAt(0)?.toUpperCase() || 'F'}
            </span>
          </div>
        )}
      </div>
    </header>
  )
}
