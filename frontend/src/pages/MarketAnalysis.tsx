import { useState, useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'
import { TrendingUp, Loader2, Info } from 'lucide-react'
import PageHeader from '../components/PageHeader'

Chart.register(...registerables)

const CROPS = ['Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Onion', 'Tomato', 'Potato', 'Soybean', 'Maize', 'Groundnut']
const STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
]

interface MarketRecord {
  market: string
  district: string
  modal_price: string
  arrival_date: string
}

export default function MarketAnalysis() {
  const [crop, setCrop] = useState('Rice')
  const [state, setState] = useState('Rajasthan')
  const [date, setDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 7)
    return d.toISOString().split('T')[0]
  })
  const [records, setRecords] = useState<MarketRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      // Format date as dd/mm/yyyy for the API
      const parts = date.split('-')
      const formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`

      const apiKey = '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b'
      const url = `https://api.data.gov.in/resource/35985678-0d79-46b4-9ed6-6f13308a1d24?api-key=${apiKey}&format=json&limit=50&filters[commodity]=${encodeURIComponent(crop)}&filters[state]=${encodeURIComponent(state)}&filters[arrival_date]=${encodeURIComponent(formattedDate)}`

      const res = await fetch(url)
      const data = await res.json()

      if (data.records && data.records.length > 0) {
        const mapped = data.records.map((r: any) => ({
          market: r.market || r.Market || '',
          district: r.district || r.District || '',
          modal_price: r.modal_price || r.Modal_Price || r.modal_x0020_price || '0',
          arrival_date: r.arrival_date || r.Arrival_Date || formattedDate,
        }))
        setRecords(mapped)
        updateChart(mapped)
      } else {
        setRecords([])
        setError('No data available for the selected filters. Try a different date or commodity.')
        if (chartInstance.current) chartInstance.current.destroy()
      }
    } catch {
      setError('Failed to fetch market data. This may be due to the Data.gov.in API being temporarily unavailable. Please try a different date or try again later.')
    } finally {
      setLoading(false)
    }
  }

  const updateChart = (data: MarketRecord[]) => {
    if (!chartRef.current) return
    if (chartInstance.current) chartInstance.current.destroy()

    const labels = data.map(r => r.market).slice(0, 15)
    const prices = data.map(r => parseFloat(r.modal_price)).slice(0, 15)

    chartInstance.current = new Chart(chartRef.current, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: `${crop} Price (₹/quintal)`,
          data: prices,
          borderColor: '#386A20',
          backgroundColor: 'rgba(56, 106, 32, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#386A20',
          pointBorderColor: '#1A1C18',
          pointRadius: 5,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#1A1C18' } },
        },
        scales: {
          x: { ticks: { color: '#73796D', maxRotation: 45 }, grid: { color: '#C3C8BB44' } },
          y: { ticks: { color: '#73796D' }, grid: { color: '#C3C8BB44' } },
        },
      },
    })
  }

  useEffect(() => { fetchData() }, [crop, state, date])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <PageHeader icon={TrendingUp} title="Market Price Analysis" subtitle="Real-time commodity prices from Indian agricultural markets." />

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm text-[var(--color-on-surface-variant)] mb-1">Commodity</label>
          <select value={crop} onChange={e => setCrop(e.target.value)} className="form-select">
            {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-[var(--color-on-surface-variant)] mb-1">State</label>
          <select value={state} onChange={e => setState(e.target.value)} className="form-select">
            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-[var(--color-on-surface-variant)] mb-1">Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="form-input" />
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <Loader2 size={24} className="animate-spin text-[var(--color-primary)] mx-auto" />
          <p className="text-[var(--color-on-surface-variant)] mt-2">Loading market data...</p>
        </div>
      )}

      {error && (
        <div className="bg-amber-50 border border-[var(--color-amber)] text-amber-800 rounded-lg p-4 mb-6 text-sm">
          <Info size={16} className="inline mr-1" />{error}
        </div>
      )}

      {/* Chart */}
      {records.length > 0 && (
        <div className="bg-white border border-[var(--color-outline-variant)] rounded-2xl shadow-[var(--shadow-sm)] p-6 mb-6">
          <h3 className="text-lg font-semibold text-[var(--color-on-surface)] mb-4">Price Trend</h3>
          <div style={{ height: '350px' }}>
            <canvas ref={chartRef}></canvas>
          </div>
        </div>
      )}

      {/* Data Table */}
      {records.length > 0 && (
        <div className="bg-white border border-[var(--color-outline-variant)] rounded-2xl shadow-[var(--shadow-sm)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-outline-variant)]">
                  <th className="text-left p-3 text-sm text-[var(--color-on-surface-variant)]">Market</th>
                  <th className="text-left p-3 text-sm text-[var(--color-on-surface-variant)]">District</th>
                  <th className="text-left p-3 text-sm text-[var(--color-on-surface-variant)]">Modal Price (₹/quintal)</th>
                  <th className="text-left p-3 text-sm text-[var(--color-on-surface-variant)]">Date</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr key={i} className="border-b border-[var(--color-outline-variant)]/50 hover:bg-[var(--color-outline-variant)]/20">
                    <td className="p-3 text-sm text-[var(--color-on-surface)]">{r.market}</td>
                    <td className="p-3 text-sm text-[var(--color-on-surface-variant)]">{r.district}</td>
                    <td className="p-3 text-sm text-[var(--color-primary)] font-semibold">₹{parseFloat(r.modal_price).toLocaleString()}</td>
                    <td className="p-3 text-sm text-[var(--color-on-surface-variant)]">{r.arrival_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
