import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { communityApi } from '../services/api'
import {
  Users, Plus, X, PenLine, Sprout, TrendingUp, CloudSun, Tractor, MessageCircle,
  Trash2, User, HelpCircle, CheckCircle, MapPin, Globe, Home, Map as MapIcon,
  Send, ChevronDown, ChevronUp, Award
} from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import PageHeader from '../components/PageHeader'
import InputCard from '../components/InputCard'
import PrimaryButton from '../components/PrimaryButton'

interface Answer {
  id: string
  content: string
  author: string
  created_at: string
}

interface Post {
  id: string
  title: string
  content: string
  category: string
  author: string
  created_at: string
  type?: 'post' | 'question'
  lat?: number | null
  lng?: number | null
  district?: string
  answers?: Answer[]
  bestAnswerId?: string | null
}

const postCategories = ['All', 'Crop Tips', 'Market Discussion', 'Weather Updates', 'Equipment Reviews', 'General']

const categoryColors: Record<string, string> = {
  'Crop Tips': '#22c55e', 'Market Discussion': '#eab308', 'Weather Updates': '#06b6d4',
  'Equipment Reviews': '#ef4444', 'General': '#8b5cf6',
}

const categoryIconMap: Record<string, typeof MessageCircle> = {
  'Crop Tips': Sprout, 'Market Discussion': TrendingUp, 'Weather Updates': CloudSun,
  'Equipment Reviews': Tractor, 'General': MessageCircle,
}

const locationFilters = [
  { key: 'global', tKey: 'community.filterGlobal', icon: Globe },
  { key: 'area', tKey: 'community.filterArea', icon: MapPin },
  { key: 'district', tKey: 'community.filterDistrict', icon: Home },
]

const defaultPosts: Post[] = [
  { id: 'default-1', title: 'Best practices for wheat sowing this Rabi season', content: 'I have been growing wheat for 10 years in Punjab. The key is to sow by mid-November and ensure proper irrigation at the crown root initiation stage. Using HD-2967 variety has given me consistent 20+ quintals per acre yield.', category: 'Crop Tips', author: 'Rajesh Kumar', created_at: new Date(Date.now() - 3600000 * 2).toISOString(), type: 'post', lat: 30.73, lng: 76.78, district: 'Chandigarh' },
  { id: 'default-2', title: 'Tomato prices rising in Maharashtra markets', content: 'Tomato prices at Nashik mandi have gone up to Rs 40/kg from Rs 15/kg last month. If you have tomato crop ready, this could be a good time to sell. The prices are expected to stay high for another 2 weeks.', category: 'Market Discussion', author: 'Amit Patel', created_at: new Date(Date.now() - 3600000 * 5).toISOString(), type: 'post', lat: 19.99, lng: 73.79, district: 'Nashik' },
  { id: 'default-3', title: 'How do I identify bacterial blight in my rice crop?', content: 'I am seeing yellow lesions on the edges of my rice leaves that are slowly turning white. Is this bacterial blight? What should I do immediately? My crop is 45 days old.', category: 'Crop Tips', author: 'Sunita Devi', created_at: new Date(Date.now() - 3600000 * 12).toISOString(), type: 'question', lat: 25.43, lng: 81.85, district: 'Prayagraj', answers: [{ id: 'a1', content: 'Yes, this sounds like bacterial leaf blight (BLB). Apply Streptocycline 0.01% + Copper Oxychloride 0.25% spray immediately. Also ensure good drainage in the field.', author: 'Dr. Arun Sharma', created_at: new Date(Date.now() - 3600000 * 10).toISOString() }], bestAnswerId: 'a1' },
  { id: 'default-4', title: 'Best drone for spraying on 5 acre farm?', content: 'I want to buy or rent a drone for pesticide spraying. My farm is about 5 acres of sugarcane. What capacity drone should I look for? What is the approximate cost?', category: 'Equipment Reviews', author: 'Priya Sharma', created_at: new Date(Date.now() - 3600000 * 24).toISOString(), type: 'question', lat: 18.52, lng: 73.86, district: 'Pune', answers: [] },
  { id: 'default-5', title: 'Heavy rainfall expected in Gujarat next week', content: 'IMD has issued advisory for heavy to very heavy rainfall in Saurashtra and Kutch regions. Farmers with standing groundnut crop should ensure proper drainage. Harvested crops should be moved to safe storage immediately.', category: 'Weather Updates', author: 'Mohit Singh', created_at: new Date(Date.now() - 3600000 * 36).toISOString(), type: 'post', lat: 22.31, lng: 70.80, district: 'Rajkot' },
]

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const greenPinIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40"><path d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.3 21.7 0 14 0z" fill="#386A20"/><circle cx="14" cy="14" r="6" fill="white"/></svg>'),
  iconSize: [28, 40],
  iconAnchor: [14, 40],
  popupAnchor: [0, -40],
})

const grayPinIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="22" height="32" viewBox="0 0 28 40"><path d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.3 21.7 0 14 0z" fill="#73796D"/><circle cx="14" cy="14" r="6" fill="white"/></svg>'),
  iconSize: [22, 32],
  iconAnchor: [11, 32],
  popupAnchor: [0, -32],
})

function FlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => { map.flyTo([lat, lng], 10, { duration: 1 }) }, [lat, lng, map])
  return null
}

export default function Community() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newCategory, setNewCategory] = useState('General')
  const [newType, setNewType] = useState<'post' | 'question'>('post')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [userDistrict, setUserDistrict] = useState('')
  const [locationFilter, setLocationFilter] = useState('global')
  const [showMap, setShowMap] = useState(false)

  const [expandedPost, setExpandedPost] = useState<string | null>(null)
  const [answerText, setAnswerText] = useState('')
  const [answerSubmitting, setAnswerSubmitting] = useState(false)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
          setUserLocation(loc)
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${loc.lat}&lon=${loc.lng}&format=json`)
            const data = await res.json()
            const district = data.address?.county || data.address?.city || data.address?.state_district || ''
            setUserDistrict(district)
          } catch { /* ignore */ }
        },
        () => { /* ignore */ }
      )
    }
  }, [])

  useEffect(() => { loadPosts() }, [])

  const loadPosts = async () => {
    try {
      setLoading(true)
      const data = await communityApi.list()
      const serverPosts = data.posts || []
      setPosts(serverPosts.length > 0 ? serverPosts : defaultPosts)
    } catch { setPosts(defaultPosts) }
    finally { setLoading(false) }
  }

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !newContent.trim()) return
    setSubmitting(true)
    setError('')
    try {
      await communityApi.create({
        title: newTitle.trim(),
        content: newContent.trim(),
        category: newCategory,
        author: user?.name || 'Anonymous Farmer',
        type: newType,
        lat: userLocation?.lat ?? null,
        lng: userLocation?.lng ?? null,
        district: userDistrict,
      })
      setNewTitle(''); setNewContent(''); setNewCategory('General'); setNewType('post'); setShowCreateForm(false)
      await loadPosts()
    } catch { setError(t('community.failedCreate')) }
    finally { setSubmitting(false) }
  }

  const handleDeletePost = async (id: string) => {
    try { await communityApi.remove(id); setPosts(prev => prev.filter(p => p.id !== id)) }
    catch { setError(t('community.failedDelete')) }
  }

  const handleAddAnswer = async (postId: string) => {
    if (!answerText.trim()) return
    setAnswerSubmitting(true)
    try {
      await communityApi.addAnswer(postId, { content: answerText.trim(), author: user?.name || 'Anonymous Farmer' })
      setAnswerText('')
      await loadPosts()
    } catch { setError(t('community.failedAnswer')) }
    finally { setAnswerSubmitting(false) }
  }

  const handleMarkBest = async (postId: string, answerId: string) => {
    try {
      await communityApi.markBestAnswer(postId, answerId)
      await loadPosts()
    } catch { setError(t('community.failedBest')) }
  }

  const filteredPosts = useMemo(() => {
    let result = posts.filter(p => activeCategory === 'All' || p.category === activeCategory)
    if (locationFilter === 'area' && userLocation) {
      result = result.filter(p => {
        if (!p.lat || !p.lng) return false
        return haversineKm(userLocation.lat, userLocation.lng, p.lat, p.lng) <= 50
      })
    } else if (locationFilter === 'district' && userDistrict) {
      result = result.filter(p => p.district && p.district.toLowerCase() === userDistrict.toLowerCase())
    }
    return result
  }, [posts, activeCategory, locationFilter, userLocation, userDistrict])

  const areaCounts = useMemo(() => {
    if (!userLocation) return { area: 0, district: 0 }
    const area = posts.filter(p => p.lat && p.lng && haversineKm(userLocation.lat, userLocation.lng, p.lat!, p.lng!) <= 50).length
    const district = userDistrict ? posts.filter(p => p.district && p.district.toLowerCase() === userDistrict.toLowerCase()).length : 0
    return { area, district }
  }, [posts, userLocation, userDistrict])

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <PageHeader icon={Users} title={t('community.title')} subtitle={t('community.subtitle')} />
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMap(!showMap)}
            className={`px-3 py-2 rounded-xl text-sm font-medium transition-all border flex items-center gap-1 ${
              showMap
                ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white'
                : 'bg-white border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] hover:border-[var(--color-primary)]'
            }`}
          >
            <MapIcon size={14} />{showMap ? t('community.feed') : t('community.map')}
          </button>
          <button onClick={() => setShowCreateForm(!showCreateForm)} className="btn-primary flex items-center gap-2 whitespace-nowrap">
            {showCreateForm ? <X size={16} /> : <Plus size={16} />}
            {showCreateForm ? t('community.cancel') : t('community.newPost')}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-[var(--color-error-container)] text-[var(--color-error)] rounded-xl p-3 mb-6 text-sm flex items-center justify-between">
          {error}
          <button onClick={() => setError('')} className="text-[var(--color-error)] hover:opacity-70 bg-transparent border-none cursor-pointer"><X size={16} /></button>
        </div>
      )}

      {showCreateForm && (
        <InputCard className="mb-8 animate-fade-in">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[var(--color-on-surface)]">
            <PenLine size={18} className="text-[var(--color-primary)]" />{t('community.createPost')}
          </h2>
          <div className="flex rounded-xl overflow-hidden border border-[var(--color-outline-variant)] mb-4">
            <button
              type="button"
              onClick={() => setNewType('post')}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors border-none cursor-pointer flex items-center justify-center gap-2 ${
                newType === 'post' ? 'bg-[var(--color-primary)] text-white' : 'bg-transparent text-[var(--color-on-surface-variant)]'
              }`}
            >
              <MessageCircle size={14} />{t('community.sharePost')}
            </button>
            <button
              type="button"
              onClick={() => setNewType('question')}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors border-none cursor-pointer flex items-center justify-center gap-2 ${
                newType === 'question' ? 'bg-amber-500 text-white' : 'bg-transparent text-[var(--color-on-surface-variant)]'
              }`}
            >
              <HelpCircle size={14} />{t('community.askQuestion')}
            </button>
          </div>
          <form onSubmit={handleCreatePost}>
            <div className="mb-4">
              <label className="block text-sm text-[var(--color-on-surface-variant)] mb-1">
                {newType === 'question' ? t('community.questionTitle') : t('community.postTitle')}
              </label>
              <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="form-input" placeholder={newType === 'question' ? t('community.questionPlaceholder') : t('community.postPlaceholder')} required />
            </div>
            <div className="mb-4">
              <label className="block text-sm text-[var(--color-on-surface-variant)] mb-1">
                {newType === 'question' ? t('community.details') : t('community.content')}
              </label>
              <textarea value={newContent} onChange={e => setNewContent(e.target.value)} className="form-input min-h-[100px] resize-y" placeholder={newType === 'question' ? t('community.detailsPlaceholder') : t('community.contentPlaceholder')} required />
            </div>
            <div className="mb-4">
              <label className="block text-sm text-[var(--color-on-surface-variant)] mb-1">{t('community.category')}</label>
              <select value={newCategory} onChange={e => setNewCategory(e.target.value)} className="form-select">
                {postCategories.filter(c => c !== 'All').map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            {userLocation && (
              <div className="mb-4 text-xs text-[var(--color-outline)] flex items-center gap-1">
                <MapPin size={12} />{t('community.locationAttached')}{userDistrict ? ` (${userDistrict})` : ''}
              </div>
            )}
            <PrimaryButton type="submit" loading={submitting}>
              {newType === 'question' ? t('community.questionBtn') : t('community.postBtn')}
            </PrimaryButton>
          </form>
        </InputCard>
      )}

      {/* Location Filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        {locationFilters.map(f => {
          const Icon = f.icon
          const count = f.key === 'global' ? posts.length : f.key === 'area' ? areaCounts.area : areaCounts.district
          return (
            <button
              key={f.key}
              onClick={() => setLocationFilter(f.key)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all border flex items-center gap-1.5 ${
                locationFilter === f.key
                  ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white'
                  : 'bg-white border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] hover:border-[var(--color-primary)]'
              }`}
            >
              <Icon size={13} />{t(f.tKey)}
              <span className="text-xs opacity-70">({count})</span>
            </button>
          )
        })}
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {postCategories.map(cat => {
          const Icon = categoryIconMap[cat] || MessageCircle
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border flex items-center gap-2 ${
                activeCategory === cat
                  ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white'
                  : 'bg-white border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] hover:border-[var(--color-primary)]'
              }`}
            >
              {cat !== 'All' && <Icon size={14} />}
              {cat}
              {cat === 'All' && <span className="ml-1 text-xs opacity-70">({filteredPosts.length})</span>}
            </button>
          )
        })}
      </div>

      {showMap ? (
        <div className="bg-white border border-[var(--color-outline-variant)] rounded-2xl overflow-hidden shadow-[var(--shadow-sm)]">
          <MapContainer
            center={userLocation ? [userLocation.lat, userLocation.lng] : [22.5, 78.5]}
            zoom={userLocation ? 8 : 5}
            style={{ height: 'calc(100vh - 340px)', minHeight: '400px', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {userLocation && (
              <>
                <FlyTo lat={userLocation.lat} lng={userLocation.lng} />
                <Marker position={[userLocation.lat, userLocation.lng]} icon={greenPinIcon}>
                  <Popup><strong className="text-green-700">{t('community.youAreHere')}</strong></Popup>
                </Marker>
              </>
            )}
            {filteredPosts.filter(p => p.lat && p.lng).map(post => (
              <Marker key={post.id} position={[post.lat!, post.lng!]} icon={grayPinIcon}>
                <Popup>
                  <div className="max-w-[220px]">
                    {post.type === 'question' && <span className="text-amber-600 text-xs font-bold">Question</span>}
                    <h4 className="font-semibold text-sm mb-1">{post.title}</h4>
                    <p className="text-xs text-gray-600 mb-1">{post.content.slice(0, 80)}...</p>
                    <p className="text-xs text-gray-400">By {post.author} · {timeAgo(post.created_at)}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      ) : loading ? (
        <div className="text-center py-16">
          <div className="loading-dots"><span></span><span></span><span></span></div>
          <p className="text-[var(--color-on-surface-variant)] mt-4">{t('community.loadingPosts')}</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-16 text-[var(--color-outline)]">
          <MessageCircle size={36} className="mx-auto mb-4" />
          <p>{t('community.noPosts')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post, i) => {
            const CatIcon = categoryIconMap[post.category] || MessageCircle
            const isQuestion = post.type === 'question'
            const isExpanded = expandedPost === post.id
            const answers = post.answers || []
            const bestAnswer = answers.find(a => a.id === post.bestAnswerId)
            const otherAnswers = answers.filter(a => a.id !== post.bestAnswerId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            const sortedAnswers = bestAnswer ? [bestAnswer, ...otherAnswers] : otherAnswers
            const isAnswered = !!post.bestAnswerId

            return (
              <div
                key={post.id}
                className={`feature-card animate-fade-in ${isQuestion ? 'border-l-4 border-l-amber-500' : ''}`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                        isQuestion ? 'bg-amber-100' : 'bg-[var(--color-primary-container)]'
                      }`}>
                        {isQuestion ? <HelpCircle size={14} className="text-amber-600" /> : <User size={14} className="text-[var(--color-primary)]" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--color-on-surface)]">{post.author}</p>
                        <p className="text-xs text-[var(--color-outline)]">
                          {timeAgo(post.created_at)}{post.district && <> · {post.district}</>}
                        </p>
                      </div>
                      <div className="ml-auto flex items-center gap-2 flex-wrap">
                        {isQuestion && isAnswered && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-50 text-green-600 flex items-center gap-1">
                            <CheckCircle size={10} />{t('community.answered')}
                          </span>
                        )}
                        {isQuestion && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-50 text-amber-600 flex items-center gap-1">
                            <HelpCircle size={10} />{t('community.question')}
                            {answers.length > 0 && <> · {answers.length} Answer{answers.length > 1 ? 's' : ''}</>}
                          </span>
                        )}
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1"
                          style={{ background: `${categoryColors[post.category] || '#8b5cf6'}18`, color: categoryColors[post.category] || '#8b5cf6' }}
                        >
                          <CatIcon size={10} />{post.category}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-[var(--color-on-surface)]">{post.title}</h3>
                    <p className="text-[var(--color-on-surface-variant)] text-sm leading-relaxed">{post.content}</p>

                    {isQuestion && (
                      <button
                        onClick={() => { setExpandedPost(isExpanded ? null : post.id); setAnswerText('') }}
                        className="mt-3 text-sm text-[var(--color-primary)] hover:underline bg-transparent border-none cursor-pointer flex items-center gap-1"
                      >
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        {isExpanded ? t('community.hideAnswers') : t('community.viewAnswers', { count: answers.length })}
                      </button>
                    )}

                    {isQuestion && isExpanded && (
                      <div className="mt-4 border-t border-[var(--color-outline-variant)] pt-4 space-y-3">
                        {sortedAnswers.length > 0 ? (
                          sortedAnswers.map(ans => {
                            const isBest = ans.id === post.bestAnswerId
                            return (
                              <div key={ans.id} className={`p-3 rounded-xl text-sm ${isBest ? 'bg-green-50 border border-green-200' : 'bg-[var(--color-surface-variant)]'}`}>
                                <div className="flex items-center gap-2 mb-1">
                                  {isBest && <Award size={14} className="text-green-600" />}
                                  <strong className={isBest ? 'text-green-700' : 'text-[var(--color-on-surface)]'}>{ans.author}</strong>
                                  {isBest && <span className="text-xs text-green-600 font-medium">{t('community.bestAnswer')}</span>}
                                  <span className="text-xs text-[var(--color-outline)] ml-auto">{timeAgo(ans.created_at)}</span>
                                </div>
                                <p className="text-[var(--color-on-surface-variant)]">{ans.content}</p>
                                {post.author === user?.name && !isBest && (
                                  <button
                                    onClick={() => handleMarkBest(post.id, ans.id)}
                                    className="mt-2 text-xs text-[var(--color-primary)] hover:underline bg-transparent border-none cursor-pointer flex items-center gap-1"
                                  >
                                    <CheckCircle size={12} />{t('community.markBest')}
                                  </button>
                                )}
                              </div>
                            )
                          })
                        ) : (
                          <p className="text-sm text-[var(--color-outline)]">{t('community.noAnswers')}</p>
                        )}
                        <div className="flex gap-2 mt-3">
                          <input
                            type="text"
                            value={answerText}
                            onChange={e => setAnswerText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAddAnswer(post.id)}
                            placeholder={t('community.writeAnswer')}
                            className="form-input flex-1 text-sm"
                          />
                          <button
                            onClick={() => handleAddAnswer(post.id)}
                            disabled={answerSubmitting || !answerText.trim()}
                            className="btn-primary px-3 disabled:opacity-50"
                          >
                            <Send size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  {post.author === user?.name && (
                    <button onClick={() => handleDeletePost(post.id)} className="text-[var(--color-outline)] hover:text-[var(--color-error)] transition-colors bg-transparent border-none cursor-pointer" title="Delete post">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
