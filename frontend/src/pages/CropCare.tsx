import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { marked } from 'marked'
import { Leaf, CloudUpload, X, Search, AlertCircle, HeartPulse, Map, ImageIcon, MapPin, Navigation } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet'
import L from 'leaflet'
import PageHeader from '../components/PageHeader'
import InputCard from '../components/InputCard'
import AIResultCard from '../components/AIResultCard'
import PrimaryButton from '../components/PrimaryButton'

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'pa', label: 'Punjabi' },
  { code: 'kn', label: 'Kannada' },
  { code: 'ta', label: 'Tamil' },
  { code: 'te', label: 'Telugu' },
  { code: 'ml', label: 'Malayalam' },
  { code: 'mr', label: 'Marathi' },
  { code: 'gu', label: 'Gujarati' },
]

const HOTSPOT_DATA = [
  { lat: 28.6139, lng: 77.209, disease: 'Yellow Rust (Wheat)', severity: 'High', region: 'Delhi NCR' },
  { lat: 30.7333, lng: 76.7794, disease: 'Leaf Blight (Rice)', severity: 'Moderate', region: 'Chandigarh, Punjab' },
  { lat: 26.8467, lng: 80.9462, disease: 'Brown Plant Hopper (Rice)', severity: 'High', region: 'Lucknow, UP' },
  { lat: 19.076, lng: 72.8777, disease: 'Late Blight (Tomato)', severity: 'Moderate', region: 'Mumbai, MH' },
  { lat: 22.5726, lng: 88.3639, disease: 'Sheath Blight (Rice)', severity: 'High', region: 'Kolkata, WB' },
  { lat: 13.0827, lng: 80.2707, disease: 'Bacterial Leaf Blight', severity: 'Low', region: 'Chennai, TN' },
  { lat: 23.2599, lng: 77.4126, disease: 'Powdery Mildew (Wheat)', severity: 'Moderate', region: 'Bhopal, MP' },
  { lat: 17.385, lng: 78.4867, disease: 'Cotton Bollworm', severity: 'High', region: 'Hyderabad, TS' },
  { lat: 15.3173, lng: 75.7139, disease: 'Downy Mildew (Grapes)', severity: 'Moderate', region: 'Hubli, KA' },
  { lat: 26.9124, lng: 75.7873, disease: 'Mustard Aphid', severity: 'Low', region: 'Jaipur, RJ' },
  { lat: 21.1702, lng: 72.8311, disease: 'Whitefly (Cotton)', severity: 'High', region: 'Surat, GJ' },
  { lat: 11.0168, lng: 76.9558, disease: 'Leaf Spot (Coconut)', severity: 'Low', region: 'Coimbatore, TN' },
  { lat: 25.3176, lng: 82.9739, disease: 'Stem Borer (Rice)', severity: 'Moderate', region: 'Varanasi, UP' },
  { lat: 31.104, lng: 77.1734, disease: 'Apple Scab', severity: 'High', region: 'Shimla, HP' },
  { lat: 20.2961, lng: 85.8245, disease: 'Gall Midge (Rice)', severity: 'Moderate', region: 'Bhubaneswar, OD' },
]

const severityColor: Record<string, string> = {
  High: '#ef4444',
  Moderate: '#f59e0b',
  Low: '#22c55e',
}

const userIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#386A20" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4" fill="white"/></svg>`),
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})

function FlyToUser({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo([lat, lng], 8, { duration: 1.5 })
  }, [lat, lng, map])
  return null
}

export default function CropCare() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [language, setLanguage] = useState('en')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState('')
  const [error, setError] = useState('')
  const [healthScore, setHealthScore] = useState<number | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState('')

  const { t } = useTranslation()

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser')
      return
    }
    setLocationLoading(true)
    setLocationError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocationLoading(false)
      },
      (err) => {
        setLocationError(err.message || 'Failed to get location')
        setLocationLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  useEffect(() => {
    detectLocation()
  }, [])

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError(t('cropCare.selectImage'))
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setError(t('cropCare.imageTooLarge'))
      return
    }
    setError('')
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const removeImage = () => {
    setSelectedFile(null)
    setPreview(null)
    setResponse('')
    setError('')
    setHealthScore(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const calculateHealthScore = (text: string): number => {
    const lower = text.toLowerCase()
    if (lower.includes('healthy') && !lower.includes('unhealthy') && !lower.includes('not healthy')) return 92
    if (lower.includes('no disease') || lower.includes('disease-free') || lower.includes('normal')) return 88
    if (lower.includes('mild') || lower.includes('minor') || lower.includes('early stage') || lower.includes('early blight')) return 65
    if (lower.includes('moderate') || lower.includes('bacterial') || lower.includes('fungal')) return 45
    if (lower.includes('severe') || lower.includes('advanced') || lower.includes('late blight') || lower.includes('wilt')) return 25
    if (lower.includes('dead') || lower.includes('rotting') || lower.includes('necrosis')) return 12
    return 55
  }

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError(t('cropCare.uploadFirst'))
      return
    }
    setLoading(true)
    setError('')
    setResponse('')
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('selected_language', language)

      const res = await fetch('/disease_prediction', { method: 'POST', body: formData })
      const data = await res.json()

      if (data.choices && data.choices[0]?.message?.content) {
        const text = data.choices[0].message.content
        setResponse(text)
        setHealthScore(calculateHealthScore(text))
      } else if (data.response) {
        setResponse(data.response)
        setHealthScore(calculateHealthScore(data.response))
      } else if (data.error) {
        setError(data.error)
      } else {
        setError('Unexpected response format')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to analyze image')
    } finally {
      setLoading(false)
    }
  }

  const getNearbyHotspots = () => {
    if (!userLocation) return []
    return HOTSPOT_DATA.filter(h => {
      const d = Math.sqrt(Math.pow(h.lat - userLocation.lat, 2) + Math.pow(h.lng - userLocation.lng, 2))
      return d < 5
    })
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <PageHeader icon={Leaf} title={t('cropCare.title')} subtitle={t('cropCare.subtitle')} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div>
          <InputCard>
            {!preview ? (
              <div
                className="upload-area"
                onClick={() => fileRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
              >
                <CloudUpload size={36} className="text-[var(--color-primary)] mb-3" />
                <p className="text-[var(--color-on-surface)] mb-1">{t('cropCare.upload')}</p>
                <p className="text-[var(--color-outline)] text-sm">{t('cropCare.uploadHint')}</p>
              </div>
            ) : (
              <div className="relative">
                <img src={preview} alt="Preview" className="w-full rounded-xl max-h-64 object-contain bg-[var(--color-surface-variant)]" />
                <button
                  onClick={removeImage}
                  className="absolute top-2 right-2 w-8 h-8 bg-[var(--color-error)] rounded-full text-white border-none cursor-pointer flex items-center justify-center"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
            />

            <div className="mt-4">
              <label className="block text-sm text-[var(--color-on-surface-variant)] mb-1">{t('cropCare.language')}</label>
              <select value={language} onChange={e => setLanguage(e.target.value)} className="form-select">
                {LANGUAGES.map(l => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
            </div>

            <PrimaryButton
              onClick={handleSubmit}
              loading={loading}
              disabled={!selectedFile}
              className="w-full mt-4 py-3 text-center"
            >
              <Search size={18} className="mr-2" />{t('cropCare.analyze')}
            </PrimaryButton>

            {error && (
              <div className="mt-4 bg-[var(--color-error-container)] text-[var(--color-error)] rounded-xl p-3 text-sm flex items-start gap-2">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />{error}
              </div>
            )}
          </InputCard>
        </div>

        {/* Results Section */}
        <div>
          {response ? (
            <div className="space-y-4 animate-fade-in">
              {healthScore !== null && (
                <InputCard>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-[var(--color-on-surface)]">
                    <HeartPulse size={20} className="text-[var(--color-primary)]" />
                    {t('cropCare.healthScore')}
                  </h3>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex-1 h-4 bg-[var(--color-surface-variant)] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                          healthScore >= 66 ? 'bg-green-500' : healthScore >= 33 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${healthScore}%` }}
                      />
                    </div>
                    <span className={`text-2xl font-bold ${
                      healthScore >= 66 ? 'text-green-600' : healthScore >= 33 ? 'text-orange-600' : 'text-red-600'
                    }`}>
                      {healthScore}%
                    </span>
                  </div>
                  <p className={`text-sm font-medium ${
                    healthScore >= 66 ? 'text-green-600' : healthScore >= 33 ? 'text-orange-600' : 'text-red-600'
                  }`}>
                    {healthScore >= 80 ? t('cropCare.excellent') :
                     healthScore >= 66 ? t('cropCare.good') :
                     healthScore >= 45 ? t('cropCare.fair') :
                     healthScore >= 25 ? t('cropCare.poor') :
                     t('cropCare.critical')}
                  </p>
                </InputCard>
              )}

              <AIResultCard response={response} title={t('cropCare.results')} />
            </div>
          ) : (
            <InputCard className="flex items-center justify-center min-h-[300px]">
              <div className="text-center text-[var(--color-outline)]">
                <ImageIcon size={36} className="mx-auto mb-3" />
                <p>{t('cropCare.uploadPrompt')}</p>
              </div>
            </InputCard>
          )}
        </div>
      </div>

      {/* Hotspot Map */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-[var(--color-on-surface)]">
            <Map size={24} className="text-[var(--color-primary)]" />
            {t('cropCare.hotspotMap')}
          </h2>
          <button
            onClick={detectLocation}
            disabled={locationLoading}
            className="btn-primary flex items-center gap-2 text-sm px-4 py-2"
          >
            <Navigation size={14} />
            {locationLoading ? t('cropCare.detecting') : t('cropCare.detectLocation')}
          </button>
        </div>

        {locationError && (
          <div className="mb-3 bg-[var(--color-error-container)] text-[var(--color-error)] rounded-xl p-3 text-sm flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />{locationError}
          </div>
        )}

        {userLocation && getNearbyHotspots().length > 0 && (
          <div className="mb-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3 text-sm">
            <strong>{t('cropCare.nearbyAlerts')}:</strong> {t('cropCare.hotspotsNear', { count: getNearbyHotspots().length })}
          </div>
        )}

        <div className="bg-white border border-[var(--color-outline-variant)] rounded-2xl overflow-hidden shadow-[var(--shadow-sm)]">
          <MapContainer
            center={userLocation ? [userLocation.lat, userLocation.lng] : [22.5, 78.5]}
            zoom={userLocation ? 8 : 5}
            style={{ height: '500px', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {userLocation && (
              <>
                <FlyToUser lat={userLocation.lat} lng={userLocation.lng} />
                <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                  <Popup>
                    <div className="text-center">
                      <strong className="text-green-700">{t('cropCare.yourLocation')}</strong>
                      <br />
                      <span className="text-xs text-gray-500">{userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</span>
                    </div>
                  </Popup>
                </Marker>
              </>
            )}

            {HOTSPOT_DATA.map((h, i) => (
              <CircleMarker
                key={i}
                center={[h.lat, h.lng]}
                radius={h.severity === 'High' ? 14 : h.severity === 'Moderate' ? 10 : 7}
                pathOptions={{
                  color: severityColor[h.severity],
                  fillColor: severityColor[h.severity],
                  fillOpacity: 0.5,
                  weight: 2,
                }}
              >
                <Popup>
                  <div>
                    <strong>{h.disease}</strong>
                    <br />
                    <span className="text-xs">{h.region}</span>
                    <br />
                    <span className="text-xs" style={{ color: severityColor[h.severity] }}>
                      {t('cropCare.severity')}: {h.severity}
                    </span>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>

        <div className="flex items-center gap-6 mt-3 text-sm text-[var(--color-on-surface-variant)]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />{t('cropCare.high')}
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />{t('cropCare.moderate')}
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />{t('cropCare.low')}
          </div>
          {userLocation && (
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-[var(--color-primary)]" />{t('cropCare.yourLocation')}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
