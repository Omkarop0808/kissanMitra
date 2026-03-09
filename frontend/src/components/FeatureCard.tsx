import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { ArrowRight } from 'lucide-react'

interface FeatureCardProps {
  to: string
  icon: LucideIcon
  color: string
  title: string
  desc: string
  delay?: number
}

export default function FeatureCard({ to, icon: Icon, color, title, desc, delay = 0 }: FeatureCardProps) {
  return (
    <Link
      to={to}
      className="feature-card no-underline block animate-fade-in"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}18` }}
        >
          <Icon size={24} style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base text-[var(--color-on-surface)] mb-1">{title}</h3>
          <p className="text-[var(--color-on-surface-variant)] text-sm leading-relaxed line-clamp-2">{desc}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1 text-[var(--color-primary)] text-sm font-medium justify-end">
        <span>Access</span>
        <ArrowRight size={16} />
      </div>
    </Link>
  )
}
