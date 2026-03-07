import { Loader2 } from 'lucide-react'
import type { ReactNode, ButtonHTMLAttributes } from 'react'

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  children: ReactNode
}

export default function PrimaryButton({ loading, children, disabled, className = '', ...props }: PrimaryButtonProps) {
  return (
    <button
      className={`btn-primary ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 size={18} className="animate-spin" />
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  )
}
