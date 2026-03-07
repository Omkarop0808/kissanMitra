import { useState } from 'react'
import { GraduationCap, Search, Sprout, Droplets, Cpu, Landmark, PlayCircle, Lightbulb, CheckCircle, LayoutGrid } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import InputCard from '../components/InputCard'

interface VideoCard {
  title: string
  thumbnail: string
  url: string
  category: string
  duration: string
}

const categories = ['All', 'Crop Management', 'Organic Farming', 'Technology', 'Schemes & Finance', 'Water Management']

const videos: VideoCard[] = [
  { title: 'Modern Farming Techniques for Indian Farmers', thumbnail: 'https://i3.ytimg.com/vi/fRlUhUWS0Hk/hqdefault.jpg', url: 'https://www.youtube.com/watch?v=fRlUhUWS0Hk', category: 'Crop Management', duration: '12:30' },
  { title: 'How to Detect Plant Diseases Early', thumbnail: 'https://i3.ytimg.com/vi/2h59wJjQfiE/hqdefault.jpg', url: 'https://www.youtube.com/watch?v=2h59wJjQfiE', category: 'Crop Management', duration: '8:45' },
  { title: 'Organic Farming Complete Guide for Beginners', thumbnail: 'https://i3.ytimg.com/vi/W9tGyNyfDbs/hqdefault.jpg', url: 'https://www.youtube.com/watch?v=W9tGyNyfDbs', category: 'Organic Farming', duration: '15:20' },
  { title: 'Vermicomposting at Home - Step by Step', thumbnail: 'https://i3.ytimg.com/vi/ckeXvykKe9A/hqdefault.jpg', url: 'https://www.youtube.com/watch?v=ckeXvykKe9A', category: 'Organic Farming', duration: '10:15' },
  { title: 'Drone Technology in Agriculture - Future of Farming', thumbnail: 'https://i3.ytimg.com/vi/fRlUhUWS0Hk/hqdefault.jpg', url: 'https://www.youtube.com/watch?v=fRlUhUWS0Hk', category: 'Technology', duration: '14:00' },
  { title: 'Smart Irrigation Systems for Small Farms', thumbnail: 'https://i3.ytimg.com/vi/W9tGyNyfDbs/hqdefault.jpg', url: 'https://www.youtube.com/watch?v=W9tGyNyfDbs', category: 'Technology', duration: '11:30' },
  { title: 'PM-KISAN Scheme - How to Apply and Get Benefits', thumbnail: 'https://i3.ytimg.com/vi/2h59wJjQfiE/hqdefault.jpg', url: 'https://www.youtube.com/watch?v=2h59wJjQfiE', category: 'Schemes & Finance', duration: '9:50' },
  { title: 'Crop Insurance (PMFBY) - Complete Guide', thumbnail: 'https://i3.ytimg.com/vi/ckeXvykKe9A/hqdefault.jpg', url: 'https://www.youtube.com/watch?v=ckeXvykKe9A', category: 'Schemes & Finance', duration: '13:10' },
  { title: 'Drip Irrigation Setup - Save Water, Grow More', thumbnail: 'https://i3.ytimg.com/vi/fRlUhUWS0Hk/hqdefault.jpg', url: 'https://www.youtube.com/watch?v=fRlUhUWS0Hk', category: 'Water Management', duration: '16:40' },
  { title: 'Rainwater Harvesting for Agriculture', thumbnail: 'https://i3.ytimg.com/vi/W9tGyNyfDbs/hqdefault.jpg', url: 'https://www.youtube.com/watch?v=W9tGyNyfDbs', category: 'Water Management', duration: '7:55' },
  { title: 'Soil Health Management - Tips for Better Yield', thumbnail: 'https://i3.ytimg.com/vi/2h59wJjQfiE/hqdefault.jpg', url: 'https://www.youtube.com/watch?v=2h59wJjQfiE', category: 'Crop Management', duration: '11:20' },
  { title: 'Natural Pest Control Methods for Indian Crops', thumbnail: 'https://i3.ytimg.com/vi/ckeXvykKe9A/hqdefault.jpg', url: 'https://www.youtube.com/watch?v=ckeXvykKe9A', category: 'Organic Farming', duration: '9:30' },
]

const categoryIconMap: Record<string, typeof LayoutGrid> = {
  'All': LayoutGrid,
  'Crop Management': Sprout,
  'Organic Farming': Sprout,
  'Technology': Cpu,
  'Schemes & Finance': Landmark,
  'Water Management': Droplets,
}

export default function Education() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredVideos = videos.filter(v => {
    const matchesCategory = activeCategory === 'All' || v.category === activeCategory
    const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <PageHeader icon={GraduationCap} title="Farming Education" subtitle="Learn modern farming techniques, government schemes, and sustainable agriculture practices." />

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-outline)]" />
          <input
            type="text"
            placeholder="Search videos..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="form-input pl-10"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map(cat => {
          const Icon = categoryIconMap[cat] || LayoutGrid
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
              <Icon size={14} />{cat}
            </button>
          )
        })}
      </div>

      {filteredVideos.length === 0 ? (
        <div className="text-center py-16 text-[var(--color-outline)]">
          <GraduationCap size={36} className="mx-auto mb-4" />
          <p>No videos found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVideos.map((video, i) => {
            const CatIcon = categoryIconMap[video.category] || LayoutGrid
            return (
              <a
                key={i}
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="feature-card no-underline block overflow-hidden animate-fade-in"
                style={{ animationDelay: `${i * 0.05}s`, padding: 0 }}
              >
                <div className="relative">
                  <img src={video.thumbnail} alt={video.title} className="w-full h-40 object-cover" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <PlayCircle size={36} className="text-white" />
                  </div>
                  <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-0.5 rounded">{video.duration}</span>
                </div>
                <div className="p-4">
                  <span className="text-xs text-[var(--color-primary)] font-medium mb-2 flex items-center gap-1">
                    <CatIcon size={12} />{video.category}
                  </span>
                  <h3 className="text-sm font-semibold leading-snug line-clamp-2 text-[var(--color-on-surface)]">{video.title}</h3>
                </div>
              </a>
            )
          })}
        </div>
      )}

      <InputCard className="mt-12">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-[var(--color-on-surface)]">
          <Lightbulb size={20} className="text-[var(--color-amber)]" />Quick Farming Tips
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            'Test your soil health regularly - at least once every cropping season for optimal yield.',
            'Use drip irrigation to save up to 60% water compared to traditional flood irrigation.',
            'Rotate crops each season to prevent soil nutrient depletion and reduce pest buildup.',
            'Apply neem oil as a natural pesticide to protect crops without harmful chemicals.',
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--color-primary-container)] flex items-center justify-center flex-shrink-0">
                <CheckCircle size={14} className="text-[var(--color-primary)]" />
              </div>
              <p className="text-[var(--color-on-surface-variant)] text-sm">{tip}</p>
            </div>
          ))}
        </div>
      </InputCard>
    </div>
  )
}
