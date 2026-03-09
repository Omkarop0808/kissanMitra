import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import {
  Bug, TrendingUp, CloudSun, Droplets, Landmark, Bot,
  UserPlus, Upload, Brain, CheckCircle, X, Star, ChevronDown,
  Leaf, Tractor, GraduationCap, Users, Heart, Recycle, Languages,
  XCircle, Rocket, LogIn, Sprout,
} from 'lucide-react'

const features = [
  { icon: Bug, title: 'Disease Detection', desc: 'AI-powered crop disease identification with 38+ disease categories and multilingual reports' },
  { icon: TrendingUp, title: 'Market Analysis', desc: 'Real-time commodity prices from Indian markets with trend visualization' },
  { icon: CloudSun, title: 'Weather Advisory', desc: 'Accurate forecasts with crop-specific agricultural recommendations' },
  { icon: Droplets, title: 'Water Calculator', desc: 'Smart water footprint estimation based on crop, soil and climate data' },
  { icon: Landmark, title: 'Gov. Schemes', desc: 'AI chatbot for government agricultural scheme information and eligibility' },
  { icon: Bot, title: 'AI Assistant', desc: 'Multi-agent AI farmer assistant with voice support in 9 Indian languages' },
]

const steps = [
  { icon: UserPlus, title: 'Create Account', desc: 'Sign up with your farm details' },
  { icon: Upload, title: 'Input Data', desc: 'Upload crop images or enter farm details' },
  { icon: Brain, title: 'AI Analysis', desc: 'Our AI analyzes and provides insights' },
  { icon: CheckCircle, title: 'Take Action', desc: 'Get personalized recommendations' },
]

const testimonials = [
  { name: 'Rajesh Kumar', location: 'Punjab', text: 'Kissan Mitra helped me detect early blight in my tomatoes. The AI recommendations saved my entire crop this season.', rating: 5 },
  { name: 'Priya Sharma', location: 'Rajasthan', text: 'The water footprint calculator helped me reduce water usage by 30%. My farm is now more sustainable.', rating: 5 },
  { name: 'Amit Patel', location: 'Gujarat', text: 'Market price alerts help me sell my crops at the best prices. I have increased my income by 20%.', rating: 4 },
  { name: 'Sunita Devi', location: 'Bihar', text: 'The equipment rental feature saved me from buying expensive machinery. Very useful for small farmers.', rating: 5 },
]

const stats = [
  { icon: Users, value: 500, suffix: '+', label: 'Farmers Helped' },
  { icon: Bug, value: 38, suffix: '+', label: 'Diseases Detected' },
  { icon: Languages, value: 9, suffix: '', label: 'Languages Supported' },
  { icon: Bot, value: 24, suffix: '/7', label: 'AI Support' },
]

const faqs = [
  { q: 'How does the AI disease detection work?', a: 'Upload a photo of your crop, and our AI model (trained on 38+ disease categories) analyzes the image to identify diseases, pests, or health issues. It provides detailed findings, causes, and treatment recommendations in your preferred language.' },
  { q: 'Is Kissan Mitra free to use?', a: 'Yes, Kissan Mitra is completely free for all Indian farmers. All features including disease detection, market analysis, weather advisory, and the AI assistant are available at no cost.' },
  { q: 'Which languages are supported?', a: 'We support 9 Indian languages: English, Hindi, Punjabi, Kannada, Tamil, Telugu, Malayalam, Marathi, and Gujarati. You can choose your preferred language for both disease reports and the AI assistant.' },
  { q: 'How accurate are the market prices?', a: 'Market prices are sourced in real-time from Data.gov.in (Indian government open data). You can view prices for 10+ crops across 27 Indian states with trend charts and regional comparisons.' },
  { q: 'Can I rent equipment through the platform?', a: 'Yes! Our Equipment Rental marketplace lets you browse tractors, harvesters, sprayers, drones and more from nearby owners. You can filter by type, location, and price, then book directly through the platform.' },
  { q: 'How does the Community forum work?', a: 'The Community feature lets you connect with fellow farmers. Share crop tips, discuss market trends, ask questions about weather or equipment, and learn from the experiences of other farmers across India.' },
]

export default function LandingPage() {
  const { login, signup, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [showLogin, setShowLogin] = useState(false)
  const [showSignup, setShowSignup] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [countersVisible, setCountersVisible] = useState(false)
  const [counters, setCounters] = useState(stats.map(() => 0))
  const statsRef = useRef<HTMLDivElement>(null)

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupPhone, setSignupPhone] = useState('')
  const [signupFarm, setSignupFarm] = useState('')

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard')
  }, [isAuthenticated, navigate])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !countersVisible) {
          setCountersVisible(true)
        }
      },
      { threshold: 0.3 }
    )
    if (statsRef.current) observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [countersVisible])

  useEffect(() => {
    if (!countersVisible) return
    const duration = 1500
    const totalSteps = 40
    const interval = duration / totalSteps
    let step = 0
    const timer = setInterval(() => {
      step++
      const progress = step / totalSteps
      setCounters(stats.map(s => Math.round(s.value * Math.min(progress, 1))))
      if (step >= totalSteps) clearInterval(timer)
    }, interval)
    return () => clearInterval(timer)
  }, [countersVisible])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(loginEmail, loginPassword)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signup({ name: signupName, email: signupEmail, password: signupPassword, phone: signupPhone, farm_name: signupFarm })
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  const closeModals = () => {
    setShowLogin(false)
    setShowSignup(false)
    setError('')
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-[var(--color-on-surface)]">
      {/* Navbar */}
      <nav className="bg-white/90 backdrop-blur-sm border-b border-[var(--color-outline-variant)] fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[var(--color-primary)] flex items-center justify-center">
              <span className="text-white text-sm font-bold">KM</span>
            </div>
            <span className="font-bold text-lg text-[var(--color-on-surface)]">{t('app.name')}</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowLogin(true)} className="btn-secondary text-sm">{t('auth.login')}</button>
            <button onClick={() => setShowSignup(true)} className="btn-primary text-sm">{t('landing.getStarted')}</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-gradient pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-white">
            {t('landing.heroTitle')}
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            {t('landing.heroSubtitle')}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button onClick={() => setShowSignup(true)} className="bg-white text-[var(--color-primary)] px-8 py-3 rounded-xl font-semibold text-lg border-none cursor-pointer hover:shadow-lg transition-all flex items-center gap-2">
              <Rocket size={20} />{t('landing.getStarted')}
            </button>
            <button onClick={() => setShowLogin(true)} className="bg-transparent text-white border-2 border-white/60 px-8 py-3 rounded-xl font-semibold text-lg cursor-pointer hover:bg-white/10 transition-all flex items-center gap-2">
              <LogIn size={20} />{t('auth.login')}
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t('landing.features')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon
              return (
                <div key={i} className="feature-card animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary-container)] flex items-center justify-center mb-4">
                    <Icon size={24} className="text-[var(--color-primary)]" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-[var(--color-on-surface)]">{f.title}</h3>
                  <p className="text-[var(--color-on-surface-variant)] text-sm">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-[var(--color-surface-variant)]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t('landing.howItWorks')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s, i) => {
              const Icon = s.icon
              return (
                <div key={i} className="text-center">
                  <div className="w-16 h-16 rounded-full bg-[var(--color-primary-container)] flex items-center justify-center mx-auto mb-4 relative">
                    <Icon size={28} className="text-[var(--color-primary)]" />
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--color-primary)] text-white rounded-full text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  </div>
                  <h3 className="font-semibold mb-2 text-[var(--color-on-surface)]">{s.title}</h3>
                  <p className="text-[var(--color-on-surface-variant)] text-sm">{s.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Kissan Mitra */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why <span className="text-[var(--color-primary)]">Kissan Mitra</span>?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white border border-[var(--color-error-container)] rounded-2xl p-6 shadow-[var(--shadow-sm)]">
              <h3 className="text-lg font-semibold text-[var(--color-error)] mb-4 flex items-center gap-2">
                <XCircle size={20} />Without Kissan Mitra
              </h3>
              <ul className="space-y-3">
                {[
                  { hours: '4+ hrs', text: 'testing soil and crops manually' },
                  { hours: '6+ hrs', text: 'guessing disease causes without data' },
                  { hours: '3+ hrs', text: 'searching for market prices across mandis' },
                  { hours: '2+ hrs', text: 'worrying about unpredictable weather' },
                  { hours: '3+ hrs', text: 'searching for government scheme eligibility' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className="text-[var(--color-error)] font-bold whitespace-nowrap">{item.hours}</span>
                    <span className="text-[var(--color-on-surface-variant)]">{item.text}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[var(--color-error)] font-semibold text-sm">= 18+ hours of guesswork every week</p>
            </div>
            <div className="bg-white border border-[var(--color-primary-container)] rounded-2xl p-6 shadow-[var(--shadow-sm)]">
              <h3 className="text-lg font-semibold text-[var(--color-primary)] mb-4 flex items-center gap-2">
                <CheckCircle size={20} />With Kissan Mitra
              </h3>
              <ul className="space-y-3">
                {[
                  'AI detects 38+ crop diseases instantly from a photo',
                  'Real-time market prices from 27 Indian states',
                  '5-day weather forecasts with farming recommendations',
                  'Government schemes chatbot answers eligibility questions',
                  'Voice-enabled AI assistant in 9 Indian languages',
                  'Equipment rental marketplace at your fingertips',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <CheckCircle size={16} className="text-[var(--color-primary)] mt-0.5 flex-shrink-0" />
                    <span className="text-[var(--color-on-surface)]">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[var(--color-primary)] font-semibold text-sm">= Everything in seconds, for free</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section ref={statsRef} className="py-16 px-4 bg-[var(--color-surface-variant)]">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => {
              const Icon = s.icon
              return (
                <div key={i} className="text-center">
                  <div className="w-14 h-14 rounded-full bg-[var(--color-primary-container)] flex items-center justify-center mx-auto mb-3">
                    <Icon size={24} className="text-[var(--color-primary)]" />
                  </div>
                  <p className="text-3xl font-bold text-[var(--color-primary)]">
                    {counters[i]}{s.suffix}
                  </p>
                  <p className="text-[var(--color-on-surface-variant)] text-sm mt-1">{s.label}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t('landing.testimonials')}
          </h2>
          <div className="relative overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
            >
              {testimonials.map((t, i) => (
                <div key={i} className="w-full flex-shrink-0 px-4">
                  <div className="testimonial-card max-w-lg mx-auto">
                    <div className="flex mb-3">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} size={16} className={j < t.rating ? 'text-[var(--color-amber)] fill-[var(--color-amber)]' : 'text-[var(--color-outline-variant)]'} />
                      ))}
                    </div>
                    <p className="text-[var(--color-on-surface-variant)] mb-4 italic">"{t.text}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--color-primary-container)] flex items-center justify-center">
                        <span className="text-sm font-bold text-[var(--color-on-primary-container)]">{t.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-[var(--color-on-surface)]">{t.name}</p>
                        <p className="text-[var(--color-on-surface-variant)] text-xs">{t.location}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentTestimonial(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors border-none cursor-pointer ${
                    i === currentTestimonial ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-outline-variant)]'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-[var(--color-surface-variant)]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t('landing.faq')}
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="faq-item">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="faq-question"
                >
                  <span>{faq.q}</span>
                  <ChevronDown size={20} className={`faq-icon ${openFaq === i ? 'faq-icon-open' : ''}`} />
                </button>
                <div className={`faq-answer ${openFaq === i ? 'faq-answer-open' : ''}`}>
                  <p className="text-[var(--color-on-surface-variant)] text-sm leading-relaxed px-5 pb-4">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[var(--color-outline-variant)] pt-12 pb-6 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center">
                  <span className="text-white text-xs font-bold">KM</span>
                </div>
                <span className="font-bold text-[var(--color-on-surface)]">{t('app.name')}</span>
              </div>
              <p className="text-[var(--color-on-surface-variant)] text-sm leading-relaxed">
                Empowering Indian farmers with AI-powered insights for smarter, sustainable agriculture.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4 text-[var(--color-on-surface)]">Features</h4>
              <ul className="space-y-2 text-sm text-[var(--color-on-surface-variant)]">
                <li className="flex items-center gap-2"><Leaf size={12} className="text-[var(--color-primary)]" />Disease Detection</li>
                <li className="flex items-center gap-2"><TrendingUp size={12} className="text-[var(--color-primary)]" />Market Prices</li>
                <li className="flex items-center gap-2"><CloudSun size={12} className="text-[var(--color-primary)]" />Weather Advisory</li>
                <li className="flex items-center gap-2"><Bot size={12} className="text-[var(--color-primary)]" />AI Assistant</li>
                <li className="flex items-center gap-2"><Tractor size={12} className="text-[var(--color-primary)]" />Equipment Rental</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4 text-[var(--color-on-surface)]">Resources</h4>
              <ul className="space-y-2 text-sm text-[var(--color-on-surface-variant)]">
                <li className="flex items-center gap-2"><GraduationCap size={12} className="text-[var(--color-primary)]" />Education Hub</li>
                <li className="flex items-center gap-2"><Users size={12} className="text-[var(--color-primary)]" />Community Forum</li>
                <li className="flex items-center gap-2"><Landmark size={12} className="text-[var(--color-primary)]" />Gov. Schemes</li>
                <li className="flex items-center gap-2"><Droplets size={12} className="text-[var(--color-primary)]" />Water Calculator</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4 text-[var(--color-on-surface)]">Support</h4>
              <ul className="space-y-2 text-sm text-[var(--color-on-surface-variant)]">
                <li className="flex items-center gap-2"><CheckCircle size={12} className="text-[var(--color-primary)]" />FAQ</li>
                <li className="flex items-center gap-2"><Heart size={12} className="text-[var(--color-primary)]" />Donate</li>
                <li className="flex items-center gap-2"><Recycle size={12} className="text-[var(--color-primary)]" />Waste Exchange</li>
                <li className="flex items-center gap-2"><Languages size={12} className="text-[var(--color-primary)]" />9 Languages</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[var(--color-outline-variant)] pt-6 text-center">
            <p className="text-[var(--color-outline)] text-sm flex items-center justify-center gap-1">
              <Sprout size={14} className="text-[var(--color-primary)]" />
              Kissan Mitra &copy; {new Date().getFullYear()} — Empowering Indian Farmers with AI
            </p>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      {showLogin && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[var(--color-on-surface)]">{t('auth.loginTitle')}</h2>
              <button onClick={closeModals} className="w-8 h-8 rounded-full hover:bg-[var(--color-surface-variant)] flex items-center justify-center bg-transparent border-none cursor-pointer transition-colors">
                <X size={20} className="text-[var(--color-on-surface-variant)]" />
              </button>
            </div>
            {error && <div className="bg-[var(--color-error-container)] text-[var(--color-error)] rounded-xl p-3 mb-4 text-sm">{error}</div>}
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="block text-sm text-[var(--color-on-surface-variant)] mb-1">{t('auth.email')}</label>
                <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="form-input" placeholder="your@email.com" required />
              </div>
              <div className="mb-6">
                <label className="block text-sm text-[var(--color-on-surface-variant)] mb-1">{t('auth.password')}</label>
                <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="form-input" placeholder="Enter password" required />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full text-center py-3">
                {loading ? t('common.loading') : t('auth.login')}
              </button>
            </form>
            <p className="text-center text-sm text-[var(--color-on-surface-variant)] mt-4">
              {t('auth.noAccount')}{' '}
              <button onClick={() => { setShowLogin(false); setShowSignup(true); setError('') }} className="text-[var(--color-primary)] bg-transparent border-none cursor-pointer underline font-medium">
                {t('auth.signup')}
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Signup Modal */}
      {showSignup && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[var(--color-on-surface)]">{t('auth.signupTitle')}</h2>
              <button onClick={closeModals} className="w-8 h-8 rounded-full hover:bg-[var(--color-surface-variant)] flex items-center justify-center bg-transparent border-none cursor-pointer transition-colors">
                <X size={20} className="text-[var(--color-on-surface-variant)]" />
              </button>
            </div>
            {error && <div className="bg-[var(--color-error-container)] text-[var(--color-error)] rounded-xl p-3 mb-4 text-sm">{error}</div>}
            <form onSubmit={handleSignup}>
              <div className="mb-3">
                <label className="block text-sm text-[var(--color-on-surface-variant)] mb-1">{t('auth.name')}</label>
                <input type="text" value={signupName} onChange={e => setSignupName(e.target.value)} className="form-input" placeholder="Your name" required />
              </div>
              <div className="mb-3">
                <label className="block text-sm text-[var(--color-on-surface-variant)] mb-1">{t('auth.email')}</label>
                <input type="email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} className="form-input" placeholder="your@email.com" required />
              </div>
              <div className="mb-3">
                <label className="block text-sm text-[var(--color-on-surface-variant)] mb-1">{t('auth.password')}</label>
                <input type="password" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} className="form-input" placeholder="Create password" required />
              </div>
              <div className="mb-3">
                <label className="block text-sm text-[var(--color-on-surface-variant)] mb-1">{t('auth.phone')}</label>
                <input type="tel" value={signupPhone} onChange={e => setSignupPhone(e.target.value)} className="form-input" placeholder="Phone number" required />
              </div>
              <div className="mb-4">
                <label className="block text-sm text-[var(--color-on-surface-variant)] mb-1">{t('auth.farmName')}</label>
                <input type="text" value={signupFarm} onChange={e => setSignupFarm(e.target.value)} className="form-input" placeholder="Your farm name" required />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full text-center py-3">
                {loading ? t('common.loading') : t('auth.signup')}
              </button>
            </form>
            <p className="text-center text-sm text-[var(--color-on-surface-variant)] mt-4">
              {t('auth.haveAccount')}{' '}
              <button onClick={() => { setShowSignup(false); setShowLogin(true); setError('') }} className="text-[var(--color-primary)] bg-transparent border-none cursor-pointer underline font-medium">
                {t('auth.login')}
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
