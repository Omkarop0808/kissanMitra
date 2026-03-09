import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Droplets, Calculator, Lightbulb, CheckCircle, AlertCircle, CalendarDays } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import InputCard from '../components/InputCard'
import PrimaryButton from '../components/PrimaryButton'

const CROPS = ['Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Maize', 'Soybean']
const SOILS = ['Clay', 'Loam', 'Sandy', 'Silt']
const IRRIGATION = ['Drip', 'Sprinkler', 'Flood', 'Furrow', 'Rainfed']

interface WaterResult {
  totalWater: number
  dailyWater: number
  weeklyWater: number
}

export default function WaterFootprint() {
  const { t } = useTranslation()
  const [cropType, setCropType] = useState('Rice')
  const [soilType, setSoilType] = useState('Loam')
  const [irrigation, setIrrigation] = useState('Drip')
  const [area, setArea] = useState('1')
  const [temperature, setTemperature] = useState('30')
  const [humidity, setHumidity] = useState('60')
  const [rainfall, setRainfall] = useState('50')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<WaterResult | null>(null)
  const [error, setError] = useState('')

  const handleCalculate = async () => {
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/calculate-water-footprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cropType, soilType, irrigationMethod: irrigation,
          area: parseFloat(area), temperature: parseFloat(temperature),
          humidity: parseFloat(humidity), rainfall: parseFloat(rainfall),
        }),
      })
      if (!res.ok) {
        let errMsg = `Server error (${res.status})`
        try { const e = await res.json(); errMsg = e.detail || e.message || errMsg } catch {}
        throw new Error(errMsg)
      }
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult({
        totalWater: data.totalWater || data.total_water || 0,
        dailyWater: data.dailyWater || data.daily_water || 0,
        weeklyWater: data.weeklyWater || data.weekly_water || 0,
      })
    } catch (err: any) {
      setError(err.message || 'Failed to calculate water footprint')
    } finally {
      setLoading(false)
    }
  }

  const getTips = (): string[] => {
    const tips: string[] = []
    if (irrigation === 'Flood') tips.push('Consider switching to drip irrigation to save up to 50% water.')
    if (irrigation === 'Furrow') tips.push('Furrow irrigation can be improved with surge flow techniques.')
    if (cropType === 'Rice') tips.push('Alternate wetting and drying (AWD) can reduce rice water usage by 20-30%.')
    if (cropType === 'Sugarcane') tips.push('Sugarcane requires significant water. Consider subsurface drip irrigation.')
    if (parseFloat(temperature) > 35) tips.push('High temperatures increase evaporation. Apply mulch to conserve moisture.')
    if (parseFloat(humidity) < 40) tips.push('Low humidity increases crop water demand. Consider windbreaks.')
    if (soilType === 'Sandy') tips.push('Sandy soil has low water retention. Add organic matter and consider more frequent watering.')
    if (tips.length === 0) tips.push('Your current setup is relatively water-efficient. Continue monitoring soil moisture levels.')
    return tips
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <PageHeader icon={Droplets} title={t('water.title')} subtitle={t('water.subtitle')} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <InputCard title="Input Parameters">
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[var(--color-on-surface-variant)] mb-1">{t('water.cropType')}</label>
              <select value={cropType} onChange={e => setCropType(e.target.value)} className="form-select">
                {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-[var(--color-on-surface-variant)] mb-1">{t('water.soilType')}</label>
              <select value={soilType} onChange={e => setSoilType(e.target.value)} className="form-select">
                {SOILS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-[var(--color-on-surface-variant)] mb-1">{t('water.irrigationMethod')}</label>
              <select value={irrigation} onChange={e => setIrrigation(e.target.value)} className="form-select">
                {IRRIGATION.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-[var(--color-on-surface-variant)] mb-1">{t('water.area')}</label>
              <input type="number" value={area} onChange={e => setArea(e.target.value)} min="0.1" step="0.1" className="form-input" />
            </div>
            <div>
              <label className="block text-sm text-[var(--color-on-surface-variant)] mb-1">{t('water.temperature')}</label>
              <input type="number" value={temperature} onChange={e => setTemperature(e.target.value)} className="form-input" />
            </div>
            <div>
              <label className="block text-sm text-[var(--color-on-surface-variant)] mb-1">{t('water.humidity')}</label>
              <input type="number" value={humidity} onChange={e => setHumidity(e.target.value)} min="0" max="100" className="form-input" />
            </div>
            <div>
              <label className="block text-sm text-[var(--color-on-surface-variant)] mb-1">{t('water.rainfall')}</label>
              <input type="number" value={rainfall} onChange={e => setRainfall(e.target.value)} min="0" className="form-input" />
            </div>
          </div>

          <PrimaryButton onClick={handleCalculate} loading={loading} className="w-full mt-6 py-3 text-center">
            <Calculator size={18} className="mr-2" />{t('water.calculate')}
          </PrimaryButton>

          {error && (
            <div className="mt-4 bg-[var(--color-error-container)] text-[var(--color-error)] rounded-xl p-3 text-sm flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />{error}
            </div>
          )}
        </InputCard>

        <div>
          {result ? (
            <div className="animate-fade-in space-y-4">
              <div className="stat-card">
                <Droplets size={24} className="text-[var(--color-primary)] mb-2 mx-auto" />
                <p className="text-sm text-[var(--color-on-surface-variant)]">{t('water.totalWater')}</p>
                <p className="text-3xl font-bold text-[var(--color-primary)]">{result.totalWater.toLocaleString(undefined, { maximumFractionDigits: 1 })} <span className="text-lg">kL</span></p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="stat-card">
                  <Droplets size={20} className="text-blue-500 mb-2 mx-auto" />
                  <p className="text-xs text-[var(--color-on-surface-variant)]">{t('water.dailyWater')}</p>
                  <p className="text-xl font-bold text-[var(--color-on-surface)]">{result.dailyWater.toLocaleString(undefined, { maximumFractionDigits: 1 })} <span className="text-sm text-[var(--color-on-surface-variant)]">kL</span></p>
                </div>
                <div className="stat-card">
                  <CalendarDays size={20} className="text-purple-500 mb-2 mx-auto" />
                  <p className="text-xs text-[var(--color-on-surface-variant)]">{t('water.weeklyWater')}</p>
                  <p className="text-xl font-bold text-[var(--color-on-surface)]">{result.weeklyWater.toLocaleString(undefined, { maximumFractionDigits: 1 })} <span className="text-sm text-[var(--color-on-surface-variant)]">kL</span></p>
                </div>
              </div>

              <InputCard>
                <h3 className="text-lg font-semibold mb-3 text-[var(--color-primary)] flex items-center gap-2">
                  <Lightbulb size={20} />{t('water.tips')}
                </h3>
                <ul className="space-y-2">
                  {getTips().map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-on-surface-variant)]">
                      <CheckCircle size={16} className="text-[var(--color-primary)] mt-0.5 flex-shrink-0" /><span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </InputCard>
            </div>
          ) : (
            <InputCard className="flex items-center justify-center min-h-[400px]">
              <div className="text-center text-[var(--color-outline)]">
                <Droplets size={36} className="mx-auto mb-3" />
                <p>Fill in the parameters and calculate</p>
                <p className="text-sm">to see your water footprint results</p>
              </div>
            </InputCard>
          )}
        </div>
      </div>
    </div>
  )
}
