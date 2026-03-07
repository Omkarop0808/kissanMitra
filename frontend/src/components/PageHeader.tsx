import type { LucideIcon } from 'lucide-react'

interface PageHeaderProps {
  icon: LucideIcon
  title: string
  subtitle: string
  color?: string
}

export default function PageHeader({ icon: Icon, title, subtitle, color = 'var(--color-primary)' }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-[var(--color-on-surface)] flex items-center gap-3 mb-1">
        <Icon size={28} style={{ color }} />
        {title}
      </h1>
      <p className="text-[var(--color-on-surface-variant)] text-sm">{subtitle}</p>
    </div>
  )
}
