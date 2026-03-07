import { useState, useRef, useEffect } from 'react'
import { marked } from 'marked'
import { Landmark, Send, HandCoins, Shield, Droplets, CreditCard, Apple, List, Bot, User } from 'lucide-react'
import PageHeader from '../components/PageHeader'

const SCHEMES = [
  { id: 'pmkisan', name: 'PM-KISAN', icon: HandCoins, question: 'Tell me about the PM-KISAN scheme - eligibility, benefits, how to apply, and important dates.' },
  { id: 'pmfby', name: 'PMFBY', icon: Shield, question: 'Tell me about the Pradhan Mantri Fasal Bima Yojana (PMFBY) - crop insurance coverage, premium rates, claim process.' },
  { id: 'pmksy', name: 'PMKSY', icon: Droplets, question: 'Tell me about the Pradhan Mantri Krishi Sinchai Yojana (PMKSY) - irrigation support, micro-irrigation subsidies, eligibility.' },
  { id: 'kcc', name: 'KCC', icon: CreditCard, question: 'Tell me about the Kisan Credit Card (KCC) scheme - loan limits, interest rates, repayment terms, how to apply.' },
  { id: 'nbhm', name: 'NBHM', icon: Apple, question: 'Tell me about the National Bamboo Mission and National Beekeeping & Honey Mission (NBHM) - subsidies and support available.' },
  { id: 'general', name: 'All Schemes', icon: List, question: 'Give me an overview of all major government agricultural schemes available for Indian farmers in 2024-25.' },
]

interface ChatMsg {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export default function Schemes() {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { id: 'welcome', role: 'assistant', content: 'Welcome! I can help you learn about government agricultural schemes. Click a scheme button below or type your question.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async (text?: string) => {
    const question = text || input.trim()
    if (!question || loading) return

    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: question }])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      })
      const data = await res.json()
      const responseText = data.response || data.choices?.[0]?.message?.content || 'Sorry, I could not get information about this scheme.'
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: responseText }])
    } catch {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Sorry, there was an error fetching scheme information. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <PageHeader icon={Landmark} title="Government Schemes" subtitle="Learn about agricultural schemes and government support for farmers." />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {SCHEMES.map(scheme => {
          const Icon = scheme.icon
          return (
            <button key={scheme.id} onClick={() => sendMessage(scheme.question)} className="scheme-btn flex items-center gap-2" disabled={loading}>
              <Icon size={16} className="text-[var(--color-primary)]" />
              <span className="text-sm">{scheme.name}</span>
            </button>
          )
        })}
      </div>

      <div className="bg-white border border-[var(--color-outline-variant)] rounded-2xl overflow-hidden flex flex-col shadow-[var(--shadow-sm)]" style={{ height: '500px' }}>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-primary-container)]'
                }`}>
                  {msg.role === 'user' ? <User size={14} className="text-white" /> : <Bot size={14} className="text-[var(--color-primary)]" />}
                </div>
                <div className={msg.role === 'user' ? 'chat-message-user' : 'chat-message-bot'}>
                  {msg.role === 'user' ? (
                    <p>{msg.content}</p>
                  ) : (
                    <div className="markdown-content" dangerouslySetInnerHTML={{ __html: marked(msg.content) as string }} />
                  )}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-[var(--color-primary-container)] flex items-center justify-center">
                  <Bot size={14} className="text-[var(--color-primary)]" />
                </div>
                <div className="chat-message-bot">
                  <div className="loading-dots"><span></span><span></span><span></span></div>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="border-t border-[var(--color-outline-variant)] p-3 flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Ask about any government scheme..." className="form-input flex-1" disabled={loading} />
          <button onClick={() => sendMessage()} disabled={loading || !input.trim()} className="btn-primary px-4 disabled:opacity-50">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
