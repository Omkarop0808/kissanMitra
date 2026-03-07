import { useState, useEffect } from 'react'
import { CloudSun, Search, RefreshCw, Wind, Droplets, Sprout, ChevronLeft, ChevronRight, CheckCircle, ArrowRight, Loader2, AlertCircle, Calendar } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import InputCard from '../components/InputCard'

interface CurrentWeather {
  temp: number
  description: string
  icon: string
  humidity: number
  wind_speed: number
  city: string
}

interface ForecastDay {
  day: string
  date: string
  icon: string
  high: number
  low: number
  description: string
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function getSeasonAdvice(month: number): string {
  if (month >= 2 && month <= 5) return 'Summer Season: Focus on heat-resistant crops. Ensure adequate irrigation. Consider mulching to retain soil moisture.'
  if (month >= 6 && month <= 9) return 'Monsoon Season: Ideal for Kharif crops (rice, maize, cotton). Ensure proper drainage. Watch for fungal diseases due to humidity.'
  return 'Winter Season: Perfect for Rabi crops (wheat, mustard, peas). Protect crops from frost. Plan field preparation for next season.'
}

function getCropAdvice(weather: CurrentWeather | null): string[] {
  if (!weather) return []
  const advice: string[] = []
  if (weather.temp > 35) advice.push('High temperature alert: Increase irrigation frequency and consider shade nets for sensitive crops.')
  if (weather.temp < 10) advice.push('Cold weather warning: Protect crops from frost using mulch or row covers.')
  if (weather.humidity > 80) advice.push('High humidity: Watch for fungal diseases. Consider preventive fungicide application.')
  if (weather.humidity < 30) advice.push('Low humidity: Apply mulch to retain soil moisture. Increase watering.')
  if (weather.wind_speed > 20) advice.push('Strong winds expected: Secure tall crops and structures. Delay spraying operations.')
  if (weather.description.toLowerCase().includes('rain')) advice.push('Rain expected: Ensure proper field drainage. Delay fertilizer application.')
  if (advice.length === 0) advice.push('Weather conditions are favorable for regular farming operations.')
  return advice
}

function getActivities(weather: CurrentWeather | null): string[] {
  if (!weather) return ['Check weather updates before planning field work']
  const activities: string[] = []
  if (weather.temp >= 20 && weather.temp <= 35 && !weather.description.toLowerCase().includes('rain')) {
    activities.push('Good conditions for field work and planting')
    activities.push('Suitable for pesticide/fertilizer application')
  }
  if (weather.description.toLowerCase().includes('rain')) {
    activities.push('Prepare drainage channels')
    activities.push('Avoid spraying chemicals')
  }
  if (weather.humidity > 70) activities.push('Monitor crops for fungal infections')
  if (weather.temp > 30) activities.push('Water crops during early morning or evening')
  if (activities.length === 0) activities.push('Regular crop monitoring recommended')
  return activities
}

export default function WeatherAdvisory() {
  const [city, setCity] = useState('Jaipur')
  const [cityInput, setCityInput] = useState('Jaipur')
  const [current, setCurrent] = useState<CurrentWeather | null>(null)
  const [forecast, setForecast] = useState<ForecastDay[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [calMonth, setCalMonth] = useState(new Date().getMonth())
  const [calYear, setCalYear] = useState(new Date().getFullYear())
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate())

  const fetchWeather = async (searchCity: string) => {
    setLoading(true)
    setError('')
    try {
      const [currentRes, forecastRes] = await Promise.all([
        fetch(`/api/weather/current?city=${encodeURIComponent(searchCity)}`),
        fetch(`/api/weather/forecast?city=${encodeURIComponent(searchCity)}`),
      ])
      const currentData = await currentRes.json()
      const forecastData = await forecastRes.json()
      if (currentData.error) throw new Error(currentData.error)
      setCurrent({
        temp: Math.round(currentData.main.temp),
        description: currentData.weather[0].description,
        icon: currentData.weather[0].icon,
        humidity: currentData.main.humidity,
        wind_speed: Math.round(currentData.wind.speed * 3.6),
        city: currentData.name,
      })
      if (forecastData.list) {
        const dayMap = new Map<string, { temps: number[], icons: string[], descs: string[] }>()
        for (const item of forecastData.list) {
          const d = new Date(item.dt * 1000)
          const key = d.toDateString()
          if (!dayMap.has(key)) dayMap.set(key, { temps: [], icons: [], descs: [] })
          const entry = dayMap.get(key)!
          entry.temps.push(item.main.temp)
          entry.icons.push(item.weather[0].icon)
          entry.descs.push(item.weather[0].description)
        }
        const days: ForecastDay[] = []
        dayMap.forEach((val, key) => {
          const d = new Date(key)
          days.push({
            day: DAYS[d.getDay()],
            date: `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`,
            icon: val.icons[Math.floor(val.icons.length / 2)],
            high: Math.round(Math.max(...val.temps)),
            low: Math.round(Math.min(...val.temps)),
            description: val.descs[Math.floor(val.descs.length / 2)],
          })
        })
        setForecast(days.slice(0, 7))
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch weather data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchWeather(city) }, [city])

  const handleSearch = () => { if (cityInput.trim()) setCity(cityInput.trim()) }
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay()
  const today = new Date()
  const isToday = (day: number) => day === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear()

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <PageHeader icon={CloudSun} title="Weather Advisory" subtitle="Agricultural weather forecast and crop recommendations." />
      <div className="flex gap-2 mb-6 max-w-md">
        <input value={cityInput} onChange={e => setCityInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="Enter city name..." className="form-input flex-1" />
        <button onClick={handleSearch} className="btn-primary px-4"><Search size={16} /></button>
        <button onClick={() => fetchWeather(city)} className="btn-secondary px-4"><RefreshCw size={16} /></button>
      </div>

      {loading && <div className="text-center py-8"><Loader2 size={24} className="animate-spin text-[var(--color-primary)] mx-auto" /></div>}
      {error && <div className="bg-[var(--color-error-container)] text-[var(--color-error)] rounded-xl p-4 mb-6 text-sm flex items-start gap-2"><AlertCircle size={16} className="mt-0.5 flex-shrink-0" />{error}</div>}

      {current && !loading && (
        <>
          <InputCard className="mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-semibold mb-1 text-[var(--color-on-surface)]">{current.city}</h2>
                <div className="flex items-center gap-3">
                  <img src={`https://openweathermap.org/img/wn/${current.icon}@2x.png`} alt="" className="w-16 h-16" />
                  <span className="text-5xl font-bold text-[var(--color-on-surface)]">{current.temp}°C</span>
                </div>
                <p className="text-[var(--color-on-surface-variant)] capitalize mt-1">{current.description}</p>
              </div>
              <div className="flex gap-6">
                <div className="text-center">
                  <Wind size={20} className="text-[var(--color-primary)] mx-auto mb-1" />
                  <p className="text-sm text-[var(--color-on-surface-variant)]">Wind</p>
                  <p className="font-semibold text-[var(--color-on-surface)]">{current.wind_speed} km/h</p>
                </div>
                <div className="text-center">
                  <Droplets size={20} className="text-[var(--color-primary)] mx-auto mb-1" />
                  <p className="text-sm text-[var(--color-on-surface-variant)]">Humidity</p>
                  <p className="font-semibold text-[var(--color-on-surface)]">{current.humidity}%</p>
                </div>
              </div>
            </div>
          </InputCard>

          {forecast.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3 text-[var(--color-on-surface)]">Forecast</h3>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {forecast.map((f, i) => (
                  <div key={i} className="weather-card flex-shrink-0">
                    <p className="font-semibold text-sm text-[var(--color-on-surface)]">{f.day}</p>
                    <p className="text-xs text-[var(--color-on-surface-variant)]">{f.date}</p>
                    <img src={`https://openweathermap.org/img/wn/${f.icon}@2x.png`} alt="" className="w-12 h-12 mx-auto" />
                    <p className="text-sm"><span className="text-[var(--color-on-surface)] font-medium">{f.high}°</span> <span className="text-[var(--color-on-surface-variant)]">{f.low}°</span></p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InputCard>
              <h3 className="text-lg font-semibold mb-3 text-[var(--color-primary)] flex items-center gap-2"><Sprout size={20} />Crop Advisory</h3>
              <ul className="space-y-2">
                {getCropAdvice(current).map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-on-surface-variant)]">
                    <CheckCircle size={16} className="text-[var(--color-primary)] mt-0.5 flex-shrink-0" /><span>{a}</span>
                  </li>
                ))}
              </ul>
              <h4 className="text-md font-semibold mt-4 mb-2 text-[var(--color-on-surface)]">Recommended Activities</h4>
              <ul className="space-y-1">
                {getActivities(current).map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-on-surface-variant)]">
                    <ArrowRight size={14} className="text-[var(--color-primary)] mt-0.5 flex-shrink-0" /><span>{a}</span>
                  </li>
                ))}
              </ul>
            </InputCard>

            <InputCard>
              <h3 className="text-lg font-semibold mb-3 text-[var(--color-primary)] flex items-center gap-2"><Calendar size={20} />Crop Calendar</h3>
              <div className="flex items-center justify-between mb-3">
                <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1) } else setCalMonth(m => m - 1) }} className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] bg-transparent border-none cursor-pointer"><ChevronLeft size={20} /></button>
                <span className="font-semibold text-[var(--color-on-surface)]">{MONTHS[calMonth]} {calYear}</span>
                <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1) } else setCalMonth(m => m + 1) }} className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] bg-transparent border-none cursor-pointer"><ChevronRight size={20} /></button>
              </div>
              <div className="calendar-grid mb-1">
                {DAYS.map(d => <div key={d} className="text-center text-xs text-[var(--color-outline)] py-1">{d}</div>)}
              </div>
              <div className="calendar-grid">
                {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e${i}`}></div>)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  return (
                    <div key={day} onClick={() => setSelectedDay(day)} className={`calendar-day ${isToday(day) ? 'today' : ''} ${selectedDay === day ? 'selected' : ''}`}>
                      {day}
                    </div>
                  )
                })}
              </div>
              <div className="mt-4 p-3 bg-[var(--color-surface-variant)] rounded-xl">
                <p className="text-sm text-[var(--color-on-surface-variant)]">{getSeasonAdvice(calMonth)}</p>
              </div>
            </InputCard>
          </div>
        </>
      )}
    </div>
  )
}
