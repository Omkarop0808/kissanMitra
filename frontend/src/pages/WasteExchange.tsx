import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { Recycle, Loader2, Trash2 } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import InputCard from '../components/InputCard'
import PrimaryButton from '../components/PrimaryButton'

interface WasteListing {
  id: string
  waste_type: string
  quantity: number
  location: string
  pickup_date: string
  seller: string
  price: number
  status: string
}

const WASTE_TYPE_KEYS = [
  { value: 'Rice Straw', tKey: 'waste.typeRiceStraw' },
  { value: 'Wheat Straw', tKey: 'waste.typeWheatStraw' },
  { value: 'Sugarcane Bagasse', tKey: 'waste.typeSugarcaneBagasse' },
  { value: 'Corn Stalks', tKey: 'waste.typeCornStalks' },
  { value: 'Cotton Stalks', tKey: 'waste.typeCottonStalks' },
  { value: 'Other', tKey: 'waste.typeOther' },
]

const RATES: Record<string, number> = {
  'Rice Straw': 1.0, 'Wheat Straw': 0.9, 'Sugarcane Bagasse': 1.2,
  'Corn Stalks': 0.8, 'Cotton Stalks': 0.7, 'Other': 0.5,
}

const wasteTKeyMap: Record<string, string> = {
  'Rice Straw': 'waste.typeRiceStraw', 'Wheat Straw': 'waste.typeWheatStraw',
  'Sugarcane Bagasse': 'waste.typeSugarcaneBagasse', 'Corn Stalks': 'waste.typeCornStalks',
  'Cotton Stalks': 'waste.typeCottonStalks', 'Other': 'waste.typeOther',
}

export default function WasteExchange() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [listings, setListings] = useState<WasteListing[]>([])
  const [loading, setLoading] = useState(true)
  const [wasteType, setWasteType] = useState('Rice Straw')
  const [quantity, setQuantity] = useState('')
  const [location, setLocation] = useState('')
  const [pickupDate, setPickupDate] = useState('')
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState('')

  const loadListings = async () => {
    try {
      const res = await fetch('/api/waste')
      const data = await res.json()
      setListings(data.listings || [])
    } catch { setListings([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { loadListings() }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddLoading(true)
    setAddError('')
    try {
      const res = await fetch('/api/waste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ waste_type: wasteType, quantity: parseFloat(quantity), location, pickup_date: pickupDate, seller: user?.name || t('common.anonymous') }),
      })
      const data = await res.json()
      if (data.success) { setQuantity(''); setLocation(''); setPickupDate(''); loadListings() }
      else { setAddError(data.message || t('waste.failedAdd')) }
    } catch { setAddError(t('waste.failedAdd')) }
    finally { setAddLoading(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('waste.confirmRemove'))) return
    try { await fetch(`/api/waste/${id}`, { method: 'DELETE' }); loadListings() } catch { /* ignore */ }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <PageHeader icon={Recycle} title={t('waste.title')} subtitle={t('waste.subtitle')} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div>
          <InputCard title={t('waste.addListing')}>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--color-on-surface-variant)] mb-1">{t('waste.wasteType')}</label>
                <select value={wasteType} onChange={e => setWasteType(e.target.value)} className="form-select">
                  {WASTE_TYPE_KEYS.map(wt => <option key={wt.value} value={wt.value}>{t(wt.tKey)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-[var(--color-on-surface-variant)] mb-1">{t('waste.quantity')}</label>
                <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} min="1" className="form-input" required />
              </div>
              <div>
                <label className="block text-sm text-[var(--color-on-surface-variant)] mb-1">{t('waste.location')}</label>
                <input value={location} onChange={e => setLocation(e.target.value)} className="form-input" placeholder={t('waste.locationPlaceholder')} required />
              </div>
              <div>
                <label className="block text-sm text-[var(--color-on-surface-variant)] mb-1">{t('waste.pickupDate')}</label>
                <input type="date" value={pickupDate} onChange={e => setPickupDate(e.target.value)} className="form-input" required />
              </div>
              {quantity && (
                <div className="bg-[var(--color-surface-variant)] rounded-xl p-3 text-center">
                  <p className="text-sm text-[var(--color-on-surface-variant)]">{t('waste.estimatedPrice')}</p>
                  <p className="text-xl font-bold text-[var(--color-primary)]">₹{(parseFloat(quantity) * (RATES[wasteType] || 0.5)).toFixed(2)}</p>
                  <p className="text-xs text-[var(--color-outline)]">{t('waste.rate')}: ₹{RATES[wasteType] || 0.5}/kg</p>
                </div>
              )}
              {addError && <div className="bg-[var(--color-error-container)] text-[var(--color-error)] rounded-xl p-2 text-sm">{addError}</div>}
              <PrimaryButton type="submit" loading={addLoading} className="w-full py-2.5 text-center">{t('waste.addBtn')}</PrimaryButton>
            </form>
          </InputCard>

          <InputCard className="mt-4">
            <h3 className="text-sm font-semibold mb-3 text-[var(--color-on-surface-variant)]">{t('waste.currentRates')}</h3>
            {Object.entries(RATES).map(([type, rate]) => (
              <div key={type} className="flex justify-between text-sm py-1.5 border-b border-[var(--color-outline-variant)]/50 last:border-0">
                <span className="text-[var(--color-on-surface-variant)]">{wasteTKeyMap[type] ? t(wasteTKeyMap[type]) : type}</span>
                <span className="text-[var(--color-primary)]">₹{rate.toFixed(2)}/kg</span>
              </div>
            ))}
          </InputCard>
        </div>

        <div className="lg:col-span-2">
          <h3 className="text-xl font-semibold mb-4 text-[var(--color-on-surface)]">{t('waste.activeListings')}</h3>
          {loading ? (
            <div className="text-center py-12"><Loader2 size={24} className="animate-spin text-[var(--color-primary)] mx-auto" /></div>
          ) : listings.length === 0 ? (
            <div className="text-center py-12 text-[var(--color-outline)] bg-white border border-[var(--color-outline-variant)] rounded-2xl">
              <Recycle size={36} className="mx-auto mb-3" /><p>{t('waste.noListings')}</p>
            </div>
          ) : (
            <div className="bg-white border border-[var(--color-outline-variant)] rounded-2xl overflow-hidden shadow-[var(--shadow-sm)]">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--color-outline-variant)]">
                      <th className="text-left p-3 text-sm text-[var(--color-on-surface-variant)]">{t('waste.type')}</th>
                      <th className="text-left p-3 text-sm text-[var(--color-on-surface-variant)]">{t('waste.qty')}</th>
                      <th className="text-left p-3 text-sm text-[var(--color-on-surface-variant)]">{t('waste.location')}</th>
                      <th className="text-left p-3 text-sm text-[var(--color-on-surface-variant)]">{t('waste.pickup')}</th>
                      <th className="text-left p-3 text-sm text-[var(--color-on-surface-variant)]">{t('waste.price')}</th>
                      <th className="text-left p-3 text-sm text-[var(--color-on-surface-variant)]">{t('waste.status')}</th>
                      <th className="text-left p-3 text-sm text-[var(--color-on-surface-variant)]"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {listings.map(listing => (
                      <tr key={listing.id} className="border-b border-[var(--color-outline-variant)]/50 hover:bg-[var(--color-surface-variant)]/30">
                        <td className="p-3 text-sm text-[var(--color-on-surface)]">{listing.waste_type}</td>
                        <td className="p-3 text-sm text-[var(--color-on-surface)]">{listing.quantity}</td>
                        <td className="p-3 text-sm text-[var(--color-on-surface-variant)]">{listing.location}</td>
                        <td className="p-3 text-sm text-[var(--color-on-surface-variant)]">{listing.pickup_date}</td>
                        <td className="p-3 text-sm text-[var(--color-primary)] font-semibold">₹{listing.price?.toFixed(2) || '—'}</td>
                        <td className="p-3 text-sm">
                          <span className={`px-2 py-0.5 rounded text-xs ${listing.status === 'scheduled' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                            {listing.status || 'pending'}
                          </span>
                        </td>
                        <td className="p-3">
                          <button onClick={() => handleDelete(listing.id)} className="text-[var(--color-error)] hover:text-red-700 bg-transparent border-none cursor-pointer text-sm">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
