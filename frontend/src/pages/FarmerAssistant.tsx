import { useState, useRef, useEffect } from 'react'
import { marked } from 'marked'
import { Bot, Globe, Mic, Square, Volume2, Send, User } from 'lucide-react'
import PageHeader from '../components/PageHeader'

const LANGUAGES = [
  { code: 'en', label: 'English', speechCode: 'en-IN' },
  { code: 'hi', label: 'Hindi', speechCode: 'hi-IN' },
  { code: 'pa', label: 'Punjabi', speechCode: 'pa-IN' },
  { code: 'kn', label: 'Kannada', speechCode: 'kn-IN' },
  { code: 'ta', label: 'Tamil', speechCode: 'ta-IN' },
  { code: 'te', label: 'Telugu', speechCode: 'te-IN' },
  { code: 'ml', label: 'Malayalam', speechCode: 'ml-IN' },
  { code: 'mr', label: 'Marathi', speechCode: 'mr-IN' },
  { code: 'gu', label: 'Gujarati', speechCode: 'gu-IN' },
]

const QUICK_QUESTIONS = [
  'What crops should I plant this season?',
  'How do I improve my soil health?',
  'What government schemes are available for farmers?',
  'How can I protect my crops from pests?',
]

interface ChatMessage {
  id: string
  sender: 'user' | 'bot'
  text: string
  suggestions?: string[]
}

export default function FarmerAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', sender: 'bot', text: 'Namaste! I am your AI Farming Assistant. I can help you with farming advice, financial guidance, government schemes, weather information, and more. How can I help you today?', suggestions: QUICK_QUESTIONS }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [language, setLanguage] = useState('en')
  const [webSearchEnabled, setWebSearchEnabled] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [chatHistory, setChatHistory] = useState<string[]>([])
  const chatEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const extractSuggestions = (text: string): string[] => {
    const suggestions: string[] = []
    const lines = text.split('\n')
    for (const line of lines) {
      if (line.trim().startsWith('>> ')) {
        suggestions.push(line.trim().substring(3))
      }
    }
    if (suggestions.length === 0) {
      if (text.toLowerCase().includes('crop') || text.toLowerCase().includes('farm')) {
        suggestions.push('Tell me more about crop rotation')
        suggestions.push('What fertilizers do you recommend?')
      }
      if (text.toLowerCase().includes('weather')) {
        suggestions.push('How should I prepare for rain?')
      }
      if (text.toLowerCase().includes('scheme') || text.toLowerCase().includes('government')) {
        suggestions.push('How do I apply for PM-KISAN?')
      }
    }
    return suggestions.slice(0, 3)
  }

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim()
    if (!messageText || loading) return

    const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text: messageText }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    const newHistory = [...chatHistory, `User: ${messageText}`]
    setChatHistory(newHistory)

    try {
      let data: any
      if (webSearchEnabled) {
        const res = await fetch('/api/web-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: messageText }),
        })
        data = await res.json()
      } else {
        const res = await fetch('/api/farmer-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: messageText, chat_history: newHistory }),
        })
        data = await res.json()
      }

      let responseText = ''
      if (data.choices && data.choices[0]?.message?.content) {
        responseText = data.choices[0].message.content
      } else if (data.response) {
        responseText = data.response
      } else {
        responseText = 'I apologize, but I could not process your request. Please try again.'
      }

      const suggestions = extractSuggestions(responseText)
      const cleanText = responseText.split('\n').filter((l: string) => !l.trim().startsWith('>> ')).join('\n')

      const botMsg: ChatMessage = { id: (Date.now() + 1).toString(), sender: 'bot', text: cleanText, suggestions }
      setMessages(prev => [...prev, botMsg])
      setChatHistory(prev => [...prev, `Assistant: ${cleanText}`])
    } catch (err: any) {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: 'bot', text: 'Sorry, I encountered an error. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const toggleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser.')
      return
    }

    if (isRecording) {
      recognitionRef.current?.stop()
      setIsRecording(false)
      return
    }

    const recognition = new SpeechRecognition()
    const lang = LANGUAGES.find(l => l.code === language)
    recognition.lang = lang?.speechCode || 'en-IN'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
      setIsRecording(false)
      setTimeout(() => sendMessage(transcript), 300)
    }

    recognition.onerror = () => setIsRecording(false)
    recognition.onend = () => setIsRecording(false)

    recognitionRef.current = recognition
    recognition.start()
    setIsRecording(true)
  }

  const speakText = (text: string) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }
    const cleanText = text.replace(/[#*`>\[\]()_~]/g, '').replace(/\n+/g, '. ')
    const utterance = new SpeechSynthesisUtterance(cleanText)
    const lang = LANGUAGES.find(l => l.code === language)
    utterance.lang = lang?.speechCode || 'en-IN'

    const voices = window.speechSynthesis.getVoices()
    const matchingVoice = voices.find(v => v.lang.startsWith(lang?.speechCode?.split('-')[0] || 'en'))
    if (matchingVoice) utterance.voice = matchingVoice

    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    setIsSpeaking(true)
    window.speechSynthesis.speak(utterance)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <PageHeader icon={Bot} title="AI Farming Assistant" subtitle="Ask any farming question in your language." />
        <div className="flex items-center gap-3">
          <select value={language} onChange={e => setLanguage(e.target.value)} className="form-select text-sm py-1.5 w-auto">
            {LANGUAGES.map(l => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
          <button
            onClick={() => setWebSearchEnabled(!webSearchEnabled)}
            className={`px-3 py-1.5 rounded-xl text-sm border transition-colors font-medium flex items-center gap-1 ${
              webSearchEnabled
                ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white'
                : 'bg-transparent border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] hover:border-[var(--color-primary)]'
            }`}
          >
            <Globe size={14} />Web Search
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {QUICK_QUESTIONS.map((q, i) => (
          <button key={i} onClick={() => sendMessage(q)} className="quick-question">{q}</button>
        ))}
      </div>

      <div className="bg-white border border-[var(--color-outline-variant)] rounded-2xl overflow-hidden flex flex-col shadow-[var(--shadow-sm)]" style={{ height: 'calc(100vh - 320px)', minHeight: '400px' }}>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-2 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.sender === 'user' ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-primary-container)]'
                }`}>
                  {msg.sender === 'user' ? <User size={14} className="text-white" /> : <Bot size={14} className="text-[var(--color-primary)]" />}
                </div>
                <div>
                  {msg.sender === 'user' ? (
                    <div className="chat-message-user">{msg.text}</div>
                  ) : (
                    <div className="chat-message-bot">
                      <div className="markdown-content" dangerouslySetInnerHTML={{ __html: marked(msg.text) as string }} />
                      <button
                        onClick={() => speakText(msg.text)}
                        className="mt-2 text-xs text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] bg-transparent border-none cursor-pointer flex items-center gap-1"
                      >
                        {isSpeaking ? <Square size={12} /> : <Volume2 size={12} />}
                        {isSpeaking ? 'Stop' : 'Listen'}
                      </button>
                    </div>
                  )}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {msg.suggestions.map((s, i) => (
                        <button key={i} onClick={() => sendMessage(s)} className="quick-question text-xs">{s}</button>
                      ))}
                    </div>
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
          <button
            onClick={toggleVoiceInput}
            className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${
              isRecording
                ? 'bg-[var(--color-error)] border-[var(--color-error)] text-white'
                : 'bg-transparent border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
            }`}
          >
            {isRecording ? <Square size={16} /> : <Mic size={16} />}
          </button>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Type your question..."
            className="form-input flex-1"
            disabled={loading}
          />
          <button onClick={() => sendMessage()} disabled={loading || !input.trim()} className="btn-primary px-4 disabled:opacity-50">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
