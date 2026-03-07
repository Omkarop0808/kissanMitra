import { useAuth } from '../context/AuthContext'

export default function GreetingBanner() {
  const { user } = useAuth()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

  return (
    <div className="bg-[var(--color-primary-container)] rounded-2xl p-6 mb-8">
      <h1 className="text-2xl font-bold text-[var(--color-on-primary-container)] mb-1">
        {greeting}, {user?.name || 'Farmer'} 🌾
      </h1>
      <p className="text-[var(--color-on-primary-container)] opacity-80 text-sm">
        Access all your farming tools and resources below.
      </p>
    </div>
  )
}
