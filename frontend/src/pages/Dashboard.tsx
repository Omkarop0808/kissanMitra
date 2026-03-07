import {
  Leaf, Bot, TrendingUp, CloudSun, Droplets,
  Landmark, Tractor, Recycle, GraduationCap, Users, Heart,
} from 'lucide-react'
import GreetingBanner from '../components/GreetingBanner'
import FeatureCard from '../components/FeatureCard'

const cards = [
  { to: '/crop-care', icon: Leaf, color: '#22c55e', title: 'Crop Health', desc: 'Detect diseases in your crops using AI-powered image analysis supporting 38+ disease categories' },
  { to: '/farmer-assistant', icon: Bot, color: '#3b82f6', title: 'AI Assistant', desc: 'Multi-agent AI assistant with voice support, web search, and 9 Indian language support' },
  { to: '/market-analysis', icon: TrendingUp, color: '#eab308', title: 'Market Prices', desc: 'Real-time commodity prices from Indian markets with trend charts and regional comparisons' },
  { to: '/weather-advisory', icon: CloudSun, color: '#06b6d4', title: 'Weather Advisory', desc: '5-day weather forecast with crop-specific agricultural recommendations and seasonal calendar' },
  { to: '/water-footprint', icon: Droplets, color: '#8b5cf6', title: 'Water Footprint', desc: 'Calculate water requirements based on crop type, soil, irrigation method, and climate data' },
  { to: '/schemes', icon: Landmark, color: '#f59e0b', title: 'Gov. Schemes', desc: 'Explore government agricultural schemes like PM-KISAN, PMFBY, KCC with AI guidance' },
  { to: '/equipment-rental', icon: Tractor, color: '#ef4444', title: 'Equipment Rental', desc: 'Browse and rent farm equipment from nearby owners at affordable daily rates' },
  { to: '/waste-exchange', icon: Recycle, color: '#10b981', title: 'Waste Exchange', desc: 'Buy and sell crop waste — turning agricultural byproducts into income' },
  { to: '/education', icon: GraduationCap, color: '#f97316', title: 'Education', desc: 'Learn modern farming techniques, organic methods, and scheme tutorials through curated videos' },
  { to: '/community', icon: Users, color: '#a855f7', title: 'Community', desc: 'Connect with fellow farmers — share tips, ask questions, and discuss market trends' },
  { to: '/donation', icon: Heart, color: '#ec4899', title: 'Support Farmers', desc: 'Contribute to empowering Indian farmers through donations and sponsorship' },
]

export default function Dashboard() {
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
            title={card.title}
            desc={card.desc}
            delay={i * 0.05}
          />
        ))}
      </div>
    </div>
  )
}
