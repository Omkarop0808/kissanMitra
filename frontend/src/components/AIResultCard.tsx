import { Sparkles } from 'lucide-react'
import { marked } from 'marked'

interface AIResultCardProps {
  response: string
  title?: string
}

export default function AIResultCard({ response, title = "Kissan Mitra's Advice" }: AIResultCardProps) {
  return (
    <div className="bg-white border border-[var(--color-outline-variant)] rounded-2xl p-6 shadow-[var(--shadow-sm)] animate-fade-in">
      <h3 className="text-lg font-semibold text-[var(--color-primary)] flex items-center gap-2 mb-4">
        <Sparkles size={20} />
        {title}
      </h3>
      <div
        className="markdown-content text-[var(--color-on-surface)]"
        dangerouslySetInnerHTML={{ __html: marked(response) as string }}
      />
    </div>
  )
}
