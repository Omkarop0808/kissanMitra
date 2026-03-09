import type { ReactNode } from 'react'

interface InputCardProps {
  title?: string
  children: ReactNode
  className?: string
}

export default function InputCard({ title, children, className = '' }: InputCardProps) {
  return (
    <div className={`bg-white border border-[var(--color-outline-variant)] rounded-2xl p-6 shadow-[var(--shadow-sm)] ${className}`}>
      {title && <h3 className="text-lg font-semibold text-[var(--color-on-surface)] mb-4">{title}</h3>}
      {children}
    </div>
  )
}
