import {
  Leaf, Bot, TrendingUp, CloudSun, Droplets,
  Landmark, Tractor, Recycle, GraduationCap, Users, Heart,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import GreetingBanner from '../components/GreetingBanner'
import FeatureCard from '../components/FeatureCard'

const cards = [
  { to: '/crop-care', icon: Leaf, color: '#22c55e', titleKey: 'nav.cropHealth', descKey: 'cropCare.subtitle' },
  { to: '/farmer-assistant', icon: Bot, color: '#3b82f6', titleKey: 'nav.aiAssistant', descKey: 'assistant.subtitle' },
  { to: '/market-analysis', icon: TrendingUp, color: '#eab308', titleKey: 'nav.market', descKey: 'market.subtitle' },
  { to: '/weather-advisory', icon: CloudSun, color: '#06b6d4', titleKey: 'nav.weather', descKey: 'weather.subtitle' },
  { to: '/water-footprint', icon: Droplets, color: '#8b5cf6', titleKey: 'nav.water', descKey: 'water.subtitle' },
  { to: '/schemes', icon: Landmark, color: '#f59e0b', titleKey: 'nav.schemes', descKey: 'schemes.subtitle' },
  { to: '/equipment-rental', icon: Tractor, color: '#ef4444', titleKey: 'nav.equipment', descKey: 'equipment.subtitle' },
  { to: '/waste-exchange', icon: Recycle, color: '#10b981', titleKey: 'nav.waste', descKey: 'waste.subtitle' },
  { to: '/education', icon: GraduationCap, color: '#f97316', titleKey: 'nav.education', descKey: 'education.subtitle' },
  { to: '/community', icon: Users, color: '#a855f7', titleKey: 'nav.community', descKey: 'community.subtitle' },
  { to: '/donation', icon: Heart, color: '#ec4899', titleKey: 'nav.donation', descKey: 'donation.subtitle' },
]

export default function Dashboard() {
  const { t } = useTranslation()
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <GreetingBanner />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {cards.map((card, i) => (
          <FeatureCard
            key={card.to}
            to={card.to}
            icon={card.icon}
            color={card.color}
            title={t(card.titleKey)}
            desc={t(card.descKey)}
            delay={i * 0.05}
          />
        ))}
      </div>
    </div>
  )
}
