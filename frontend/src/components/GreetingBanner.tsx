import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'

export default function GreetingBanner() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? t('dashboard.goodMorning') : hour < 17 ? t('dashboard.goodAfternoon') : t('dashboard.goodEvening')

  return (
    <div className="bg-[var(--color-primary-container)] rounded-2xl p-6 mb-8">
      <h1 className="text-2xl font-bold text-[var(--color-on-primary-container)] mb-1">
        {t('dashboard.greeting', { greeting, name: user?.name || 'Farmer' })}
      </h1>
      <p className="text-[var(--color-on-primary-container)] opacity-80 text-sm">
        {t('dashboard.subtitle')}
      </p>
    </div>
  )
}
