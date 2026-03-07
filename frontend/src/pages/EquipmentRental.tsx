import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { bookingsApi } from '../services/api'
import {
  Tractor, Plus, MapPin, Star, CalendarCheck, X, Loader2,
  CheckCircle, XCircle, Phone, UserCheck, CreditCard, Banknote, Smartphone,
  ClipboardList, ExternalLink
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import PageHeader from '../components/PageHeader'
import PrimaryButton from '../components/PrimaryButton'
import InputCard from '../components/InputCard'

interface Equipment {
  id: string
  name: string
  type: string
  daily_rate: number
  location: string
  description: string
  owner: string
  image?: string
  rating?: number
  reviews?: number
}

interface Booking {
  id: string
  equipment_id: string
  equipment_name: string
  equipment_owner: string
  renter_name: string
  renter_phone: string
  start_date: string
  end_date: string
  daily_rate: number
  total_cost?: number
  days?: number
  status: 'pending' | 'confirmed' | 'declined'
  payment_method?: string | null
  payment_details?: any
  created_at: string
}

const EQUIPMENT_TYPES = ['All', 'Tractor', 'Harvester', 'Sprayer', 'Plough', 'Rotavator', 'Drone', 'Other']

const DEFAULT_IMAGES: Record<string, string> = {
  tractor: '/images/tractor.jpg',
  harvester: '/images/Combine-Harvester.jpg',
  sprayer: '/images/sprayer.jpg',
  rotavator: '/images/Rotavator.jpg',
}

export default function EquipmentRental() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'browse' | 'my-listings'>('browse')
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('All')
  const [filterLocation, setFilterLocation] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  // Booking modal
  const [bookingItem, setBookingItem] = useState<Equipment | null>(null)
  const [bookName, setBookName] = useState('')
  const [bookPhone, setBookPhone] = useState('')
  const [bookStart, setBookStart] = useState('')
  const [bookEnd, setBookEnd] = useState('')
  const [bookLoading, setBookLoading] = useState(false)
  const [bookError, setBookError] = useState('')
  const [bookSuccess, setBookSuccess] = useState('')

  // Add equipment modal
  const [showAdd, setShowAdd] = useState(false)
  const [addName, setAddName] = useState('')
  const [addType, setAddType] = useState('Tractor')
  const [addRate, setAddRate] = useState('')
  const [addLocation, setAddLocation] = useState('')
  const [addDesc, setAddDesc] = useState('')
  const [addLoading, setAddLoading] = useState(false)

  // My listings
  const [myBookings, setMyBookings] = useState<Booking[]>([])
  const [myBookingsLoading, setMyBookingsLoading] = useState(false)

  // Payment modal
  const [paymentBooking, setPaymentBooking] = useState<Booking | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'bank' | null>(null)
  const [upiId, setUpiId] = useState('')
  const [bankName, setBankName] = useState('')
  const [bankAccount, setBankAccount] = useState('')
  const [bankIfsc, setBankIfsc] = useState('')
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState('')

  const loadEquipment = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterType !== 'All') params.set('type', filterType)
      if (filterLocation) params.set('location', filterLocation)
      if (minPrice) params.set('min_price', minPrice)
      if (maxPrice) params.set('max_price', maxPrice)
      const res = await fetch(`/api/equipment?${params.toString()}`)
      const data = await res.json()
      setEquipment(data.equipment || [])
    } catch { setEquipment([]) }
    finally { setLoading(false) }
  }

  const loadMyBookings = async () => {
    if (!user?.name) return
    setMyBookingsLoading(true)
    try {
      const data = await bookingsApi.list({ owner: user.name })
      setMyBookings(data.bookings || [])
    } catch { setMyBookings([]) }
    finally { setMyBookingsLoading(false) }
  }

  useEffect(() => { loadEquipment() }, [filterType, filterLocation, minPrice, maxPrice])
  useEffect(() => { if (activeTab === 'my-listings') loadMyBookings() }, [activeTab])

  const getImage = (item: Equipment) => {
    if (item.image) return item.image
    const typeLower = item.type?.toLowerCase() || item.name?.toLowerCase() || ''
    for (const [key, url] of Object.entries(DEFAULT_IMAGES)) {
      if (typeLower.includes(key) || item.name?.toLowerCase().includes(key)) return url
    }
    return '/images/equipment-placeholder.svg'
  }

  const calcDays = () => {
    if (!bookStart || !bookEnd) return 0
    const diff = new Date(bookEnd).getTime() - new Date(bookStart).getTime()
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }

  const handleBook = async () => {
    if (!bookingItem || !bookName || !bookPhone || !bookStart || !bookEnd) { setBookError('Please fill all fields'); return }
    if (!/^\d{10}$/.test(bookPhone.replace(/\D/g, ''))) { setBookError('Please enter a valid 10-digit phone number'); return }
    setBookLoading(true)
    setBookError('')
    try {
      const res = await fetch(`/api/equipment/${bookingItem.id}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ renter_name: bookName, renter_phone: bookPhone, start_date: bookStart, end_date: bookEnd }),
      })
      const data = await res.json()
      if (data.success) {
        setBookSuccess(t('equipment.awaitingConfirm'))
        setTimeout(() => { setBookingItem(null); setBookSuccess('') }, 3000)
      } else { setBookError(data.message || 'Booking failed') }
    } catch { setBookError('Failed to complete booking') }
    finally { setBookLoading(false) }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddLoading(true)
    try {
      const res = await fetch('/api/equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: addName, type: addType, daily_rate: parseFloat(addRate), location: addLocation, description: addDesc, owner: user?.name || 'Anonymous' }),
      })
      const data = await res.json()
      if (data.success) {
        setShowAdd(false)
        setAddName(''); setAddRate(''); setAddLocation(''); setAddDesc('')
        loadEquipment()
      }
    } catch { /* ignore */ } finally { setAddLoading(false) }
  }

  const handleConfirmBooking = (booking: Booking) => {
    setPaymentBooking(booking)
    setPaymentMethod(null)
    setPaymentSuccess('')
    setUpiId(''); setBankName(''); setBankAccount(''); setBankIfsc('')
  }

  const handleDeclineBooking = async (bookingId: string) => {
    try {
      await bookingsApi.updateStatus(bookingId, { status: 'declined' })
      loadMyBookings()
    } catch { /* ignore */ }
  }

  const handlePaymentSubmit = async () => {
    if (!paymentBooking || !paymentMethod) return
    setPaymentLoading(true)
    try {
      const details: any = { method: paymentMethod }
      if (paymentMethod === 'upi') details.upiId = upiId
      if (paymentMethod === 'bank') {
        details.accountName = bankName
        details.accountNumber = bankAccount
        details.ifsc = bankIfsc
      }
      await bookingsApi.updateStatus(paymentBooking.id, {
        status: 'confirmed',
        payment_method: paymentMethod,
        payment_details: details,
      })
      setPaymentSuccess('Booking confirmed! Payment details shared.')
      setTimeout(() => { setPaymentBooking(null); setPaymentSuccess(''); loadMyBookings() }, 2500)
    } catch { /* ignore */ }
    finally { setPaymentLoading(false) }
  }

  const getWhatsAppUrl = (booking: Booking) => {
    const phone = booking.renter_phone.replace(/\D/g, '')
    let msg = ''
    if (paymentMethod === 'upi') {
      msg = `Hi ${booking.renter_name}, your booking for ${booking.equipment_name} is confirmed! Please send ₹${booking.total_cost?.toLocaleString() || '—'} to my GPay/UPI: ${upiId}. Contact me for any queries — Kissan Mitra`
    } else if (paymentMethod === 'bank') {
      msg = `Hi ${booking.renter_name}, your booking for ${booking.equipment_name} is confirmed! Please transfer ₹${booking.total_cost?.toLocaleString() || '—'} to:\nName: ${bankName}\nA/C: ${bankAccount}\nIFSC: ${bankIfsc}\n— Kissan Mitra`
    }
    return `https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`
  }

  const myEquipment = equipment.filter(e => e.owner === user?.name)
  const myEquipmentIds = new Set(myEquipment.map(e => e.id))
  const ownerBookings = myBookings.filter(b => myEquipmentIds.has(b.equipment_id) || b.equipment_owner === user?.name)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <PageHeader icon={Tractor} title={t('equipment.title')} subtitle={t('equipment.subtitle')} />
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2"><Plus size={16} />{t('equipment.listEquipment')}</button>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl overflow-hidden border border-[var(--color-outline-variant)] mb-6 max-w-xs">
        <button
          onClick={() => setActiveTab('browse')}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors border-none cursor-pointer ${
            activeTab === 'browse' ? 'bg-[var(--color-primary)] text-white' : 'bg-transparent text-[var(--color-on-surface-variant)]'
          }`}
        >
          {t('equipment.browse')}
        </button>
        <button
          onClick={() => setActiveTab('my-listings')}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors border-none cursor-pointer flex items-center justify-center gap-1 ${
            activeTab === 'my-listings' ? 'bg-[var(--color-primary)] text-white' : 'bg-transparent text-[var(--color-on-surface-variant)]'
          }`}
        >
          <ClipboardList size={14} />{t('equipment.myListings')}
        </button>
      </div>

      {activeTab === 'browse' ? (
        <>
          {/* Filters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="form-select">
              {EQUIPMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input value={filterLocation} onChange={e => setFilterLocation(e.target.value)} placeholder={t('equipment.location')} className="form-input" />
            <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="Min /day" className="form-input" />
            <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="Max /day" className="form-input" />
          </div>

          {loading ? (
            <div className="text-center py-12"><Loader2 size={24} className="animate-spin text-[var(--color-primary)] mx-auto" /></div>
          ) : equipment.length === 0 ? (
            <div className="text-center py-12 text-[var(--color-outline)]"><Tractor size={36} className="mx-auto mb-3" /><p>{t('equipment.noEquipment')}</p></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {equipment.map(item => (
                <div key={item.id} className="item-card">
                  <img src={getImage(item)} alt={item.name} className="w-full h-48 object-cover" onError={e => (e.currentTarget.src = '/images/equipment-placeholder.svg')} />
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg text-[var(--color-on-surface)]">{item.name}</h3>
                      <span className="text-[var(--color-primary)] font-bold">{item.daily_rate}{t('equipment.perDay')}</span>
                    </div>
                    <p className="text-[var(--color-on-surface-variant)] text-sm mb-2">{item.description}</p>
                    <p className="text-[var(--color-outline)] text-xs mb-1 flex items-center gap-1"><MapPin size={12} />{item.location}</p>
                    {item.rating && (
                      <div className="flex items-center gap-1 mb-3 text-sm">
                        {[...Array(5)].map((_, i) => <Star key={i} size={12} className={i < Math.round(item.rating!) ? 'text-amber-400 fill-amber-400' : 'text-[var(--color-outline-variant)]'} />)}
                        <span className="text-[var(--color-on-surface-variant)] text-xs ml-1">({item.reviews || 0})</span>
                      </div>
                    )}
                    <button onClick={() => { setBookingItem(item); setBookName(user?.name || ''); setBookPhone(user?.phone || ''); setBookError(''); setBookSuccess('') }} className="btn-primary w-full text-center py-2 text-sm flex items-center justify-center gap-1">
                      <CalendarCheck size={14} />{t('equipment.bookNow')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* My Listings Tab */
        <div>
          {myBookingsLoading ? (
            <div className="text-center py-12"><Loader2 size={24} className="animate-spin text-[var(--color-primary)] mx-auto" /></div>
          ) : myEquipment.length === 0 ? (
            <div className="text-center py-12 text-[var(--color-outline)]">
              <Tractor size={36} className="mx-auto mb-3" />
              <p>{t('equipment.notListed')}</p>
              <button onClick={() => setShowAdd(true)} className="btn-primary mt-4 flex items-center gap-2 mx-auto"><Plus size={16} />{t('equipment.listEquipment')}</button>
            </div>
          ) : (
            <div className="space-y-6">
              {myEquipment.map(item => {
                const itemBookings = ownerBookings.filter(b => b.equipment_id === item.id)
                return (
                  <InputCard key={item.id}>
                    <div className="flex items-start gap-4 mb-4">
                      <img src={getImage(item)} alt={item.name} className="w-20 h-20 rounded-xl object-cover" onError={e => (e.currentTarget.src = '/images/equipment-placeholder.svg')} />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-[var(--color-on-surface)]">{item.name}</h3>
                        <p className="text-sm text-[var(--color-on-surface-variant)]">{item.daily_rate}{t('equipment.perDay')} · {item.location}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
                          itemBookings.some(b => b.status === 'confirmed') ? 'bg-blue-50 text-blue-600' :
                          itemBookings.some(b => b.status === 'pending') ? 'bg-amber-50 text-amber-600' :
                          'bg-green-50 text-green-600'
                        }`}>
                          {itemBookings.some(b => b.status === 'confirmed') ? t('equipment.rented') :
                           itemBookings.some(b => b.status === 'pending') ? t('equipment.pending') :
                           t('equipment.available')}
                        </span>
                      </div>
                    </div>

                    {itemBookings.length > 0 ? (
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-[var(--color-on-surface-variant)]">{t('equipment.bookingRequests')}</h4>
                        {itemBookings.map(booking => (
                          <div key={booking.id} className={`p-3 rounded-xl border text-sm ${
                            booking.status === 'confirmed' ? 'bg-green-50 border-green-200' :
                            booking.status === 'declined' ? 'bg-red-50 border-red-200' :
                            'bg-[var(--color-surface-variant)] border-[var(--color-outline-variant)]'
                          }`}>
                            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                              <div className="flex items-center gap-2">
                                <UserCheck size={14} className="text-[var(--color-primary)]" />
                                <strong>{booking.renter_name}</strong>
                              </div>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                booking.status === 'declined' ? 'bg-red-100 text-red-700' :
                                'bg-amber-100 text-amber-700'
                              }`}>
                                {booking.status === 'confirmed' ? (booking.payment_method ? t('equipment.payment.paymentShared') : t('common.confirm')) :
                                 booking.status === 'declined' ? t('common.decline') : t('equipment.pending')}
                              </span>
                            </div>
                            <p className="flex items-center gap-1 text-[var(--color-on-surface-variant)]">
                              <Phone size={12} />{booking.renter_phone}
                            </p>
                            <p className="text-[var(--color-on-surface-variant)]">
                              {booking.start_date} to {booking.end_date}
                              {booking.total_cost && <> · <strong className="text-[var(--color-primary)]">{booking.total_cost.toLocaleString()}</strong></>}
                            </p>

                            {booking.status === 'pending' && (
                              <div className="flex gap-2 mt-3">
                                <button
                                  onClick={() => handleConfirmBooking(booking)}
                                  className="btn-primary flex-1 py-2 text-sm flex items-center justify-center gap-1"
                                >
                                  <CheckCircle size={14} />{t('equipment.confirmBooking')}
                                </button>
                                <button
                                  onClick={() => handleDeclineBooking(booking.id)}
                                  className="flex-1 py-2 text-sm rounded-xl border border-[var(--color-error)] text-[var(--color-error)] bg-transparent cursor-pointer hover:bg-red-50 transition-colors flex items-center justify-center gap-1"
                                >
                                  <XCircle size={14} />{t('equipment.declineBooking')}
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-[var(--color-outline)]">{t('equipment.noBookings')}</p>
                    )}
                  </InputCard>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Booking Modal */}
      {bookingItem && (
        <div className="modal-overlay" onClick={() => setBookingItem(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[var(--color-on-surface)]">Book: {bookingItem.name}</h3>
              <button onClick={() => setBookingItem(null)} className="w-8 h-8 rounded-full hover:bg-[var(--color-surface-variant)] flex items-center justify-center bg-transparent border-none cursor-pointer"><X size={18} /></button>
            </div>
            {bookSuccess ? (
              <div className="bg-green-50 border border-green-300 text-green-700 rounded-xl p-4 text-center">{bookSuccess}</div>
            ) : (
              <>
                {bookError && <div className="bg-[var(--color-error-container)] text-[var(--color-error)] rounded-xl p-3 mb-3 text-sm">{bookError}</div>}
                <div className="space-y-3">
                  <div><label className="block text-sm text-[var(--color-on-surface-variant)] mb-1">{t('equipment.fullName')} *</label><input value={bookName} onChange={e => setBookName(e.target.value)} className="form-input" required /></div>
                  <div><label className="block text-sm text-[var(--color-on-surface-variant)] mb-1">{t('equipment.phoneNumber')} *</label><input value={bookPhone} onChange={e => setBookPhone(e.target.value)} className="form-input" placeholder="10-digit phone number" required /></div>
                  <div><label className="block text-sm text-[var(--color-on-surface-variant)] mb-1">{t('equipment.startDate')} *</label><input type="date" value={bookStart} onChange={e => setBookStart(e.target.value)} className="form-input" required /></div>
                  <div><label className="block text-sm text-[var(--color-on-surface-variant)] mb-1">{t('equipment.endDate')} *</label><input type="date" value={bookEnd} onChange={e => setBookEnd(e.target.value)} className="form-input" required /></div>
                  {bookStart && bookEnd && calcDays() > 0 && (
                    <div className="bg-[var(--color-surface-variant)] rounded-xl p-3 text-center">
                      <p className="text-sm text-[var(--color-on-surface-variant)]">{calcDays()} days x {bookingItem.daily_rate} = <span className="text-[var(--color-primary)] font-bold text-lg">{(bookingItem.daily_rate * calcDays()).toLocaleString()}</span></p>
                    </div>
                  )}
                </div>
                <PrimaryButton onClick={handleBook} loading={bookLoading} className="w-full mt-4 py-2.5 text-center">{t('equipment.submitBooking')}</PrimaryButton>
              </>
            )}
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {paymentBooking && (
        <div className="modal-overlay" onClick={() => setPaymentBooking(null)}>
          <div className="modal-content max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[var(--color-on-surface)]">
                {paymentSuccess ? t('equipment.payment.confirmed') : t('equipment.payment.title')}
              </h3>
              <button onClick={() => setPaymentBooking(null)} className="w-8 h-8 rounded-full hover:bg-[var(--color-surface-variant)] flex items-center justify-center bg-transparent border-none cursor-pointer"><X size={18} /></button>
            </div>

            {paymentSuccess ? (
              <div className="bg-green-50 border border-green-300 text-green-700 rounded-xl p-4 text-center">
                <CheckCircle size={24} className="mx-auto mb-2" />
                {paymentSuccess}
              </div>
            ) : !paymentMethod ? (
              <div className="space-y-3">
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className="w-full p-4 rounded-xl border border-[var(--color-outline-variant)] hover:border-[var(--color-primary)] transition-colors text-left flex items-center gap-4 bg-transparent cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center"><Banknote size={24} className="text-green-600" /></div>
                  <div>
                    <p className="font-semibold text-[var(--color-on-surface)]">{t('equipment.payment.cash')}</p>
                    <p className="text-sm text-[var(--color-on-surface-variant)]">{t('equipment.payment.cashDesc')}</p>
                  </div>
                </button>
                <button
                  onClick={() => setPaymentMethod('upi')}
                  className="w-full p-4 rounded-xl border border-[var(--color-outline-variant)] hover:border-[var(--color-primary)] transition-colors text-left flex items-center gap-4 bg-transparent cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center"><Smartphone size={24} className="text-blue-600" /></div>
                  <div>
                    <p className="font-semibold text-[var(--color-on-surface)]">{t('equipment.payment.upi')}</p>
                    <p className="text-sm text-[var(--color-on-surface-variant)]">{t('equipment.payment.upiDesc')}</p>
                  </div>
                </button>
                <button
                  onClick={() => setPaymentMethod('bank')}
                  className="w-full p-4 rounded-xl border border-[var(--color-outline-variant)] hover:border-[var(--color-primary)] transition-colors text-left flex items-center gap-4 bg-transparent cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center"><CreditCard size={24} className="text-purple-600" /></div>
                  <div>
                    <p className="font-semibold text-[var(--color-on-surface)]">{t('equipment.payment.bank')}</p>
                    <p className="text-sm text-[var(--color-on-surface-variant)]">{t('equipment.payment.bankDesc')}</p>
                  </div>
                </button>
              </div>
            ) : paymentMethod === 'cash' ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <Banknote size={28} className="text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-green-700">{t('equipment.payment.cashAgreed')}</p>
                </div>
                <div className="bg-[var(--color-surface-variant)] rounded-xl p-3">
                  <p className="text-sm"><strong>{t('equipment.payment.renter')}:</strong> {paymentBooking.renter_name}</p>
                  <p className="text-sm flex items-center gap-1"><Phone size={12} />{paymentBooking.renter_phone}</p>
                  <p className="text-sm"><strong>{t('equipment.payment.amount')}:</strong> <span className="text-[var(--color-primary)] font-bold">{paymentBooking.total_cost?.toLocaleString() || '—'}</span></p>
                </div>
                <PrimaryButton onClick={handlePaymentSubmit} loading={paymentLoading} className="w-full py-2.5 text-center">
                  {t('equipment.confirmBooking')}
                </PrimaryButton>
                <button onClick={() => setPaymentMethod(null)} className="w-full text-sm text-[var(--color-on-surface-variant)] hover:underline bg-transparent border-none cursor-pointer">{t('equipment.payment.backToOptions')}</button>
              </div>
            ) : paymentMethod === 'upi' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[var(--color-on-surface-variant)] mb-1">{t('equipment.payment.upiPlaceholder')}</label>
                  <input value={upiId} onChange={e => setUpiId(e.target.value)} className="form-input" placeholder="example@upi or 9876543210" />
                </div>
                {upiId && (
                  <>
                    <div className="flex justify-center">
                      <div className="bg-white p-4 rounded-xl border border-[var(--color-outline-variant)]">
                        <QRCodeSVG
                          value={`upi://pay?pa=${upiId}&pn=${user?.name || 'Owner'}&am=${paymentBooking.total_cost || 0}&cu=INR&tn=Equipment rental - ${paymentBooking.equipment_name}`}
                          size={180}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-[var(--color-outline)] text-center">{t('equipment.payment.scanQR')}</p>
                    <a
                      href={getWhatsAppUrl(paymentBooking)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary w-full py-2.5 text-center flex items-center justify-center gap-2 no-underline"
                    >
                      <ExternalLink size={14} />{t('equipment.payment.shareWhatsApp')}
                    </a>
                  </>
                )}
                <PrimaryButton onClick={handlePaymentSubmit} loading={paymentLoading} disabled={!upiId} className="w-full py-2.5 text-center">
                  {t('equipment.payment.confirmShare')}
                </PrimaryButton>
                <button onClick={() => setPaymentMethod(null)} className="w-full text-sm text-[var(--color-on-surface-variant)] hover:underline bg-transparent border-none cursor-pointer">{t('equipment.payment.backToOptions')}</button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[var(--color-on-surface-variant)] mb-1">{t('equipment.payment.accountName')}</label>
                  <input value={bankName} onChange={e => setBankName(e.target.value)} className="form-input" />
                </div>
                <div>
                  <label className="block text-sm text-[var(--color-on-surface-variant)] mb-1">{t('equipment.payment.accountNumber')}</label>
                  <input value={bankAccount} onChange={e => setBankAccount(e.target.value)} className="form-input" />
                </div>
                <div>
                  <label className="block text-sm text-[var(--color-on-surface-variant)] mb-1">{t('equipment.payment.ifsc')}</label>
                  <input value={bankIfsc} onChange={e => setBankIfsc(e.target.value)} className="form-input" placeholder="e.g. SBIN0001234" />
                </div>
                {bankName && bankAccount && bankIfsc && (
                  <>
                    <div className="bg-[var(--color-surface-variant)] rounded-xl p-3">
                      <p className="text-xs text-[var(--color-outline)] mb-1">{t('equipment.payment.bankSummary')}</p>
                      <p className="text-sm"><strong>Name:</strong> {bankName}</p>
                      <p className="text-sm"><strong>A/C:</strong> {bankAccount}</p>
                      <p className="text-sm"><strong>IFSC:</strong> {bankIfsc}</p>
                      <p className="text-sm"><strong>{t('equipment.payment.amount')}:</strong> <span className="text-[var(--color-primary)] font-bold">{paymentBooking.total_cost?.toLocaleString() || '—'}</span></p>
                    </div>
                    <a
                      href={getWhatsAppUrl(paymentBooking)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary w-full py-2.5 text-center flex items-center justify-center gap-2 no-underline"
                    >
                      <ExternalLink size={14} />{t('equipment.payment.shareWhatsApp')}
                    </a>
                  </>
                )}
                <PrimaryButton onClick={handlePaymentSubmit} loading={paymentLoading} disabled={!bankName || !bankAccount || !bankIfsc} className="w-full py-2.5 text-center">
                  {t('equipment.payment.confirmShare')}
                </PrimaryButton>
                <button onClick={() => setPaymentMethod(null)} className="w-full text-sm text-[var(--color-on-surface-variant)] hover:underline bg-transparent border-none cursor-pointer">{t('equipment.payment.backToOptions')}</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Equipment Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[var(--color-on-surface)]">{t('equipment.listEquipment')}</h3>
              <button onClick={() => setShowAdd(false)} className="w-8 h-8 rounded-full hover:bg-[var(--color-surface-variant)] flex items-center justify-center bg-transparent border-none cursor-pointer"><X size={18} /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-3">
              <div><label className="block text-sm text-[var(--color-on-surface-variant)] mb-1">{t('equipment.equipmentName')}</label><input value={addName} onChange={e => setAddName(e.target.value)} className="form-input" required /></div>
              <div><label className="block text-sm text-[var(--color-on-surface-variant)] mb-1">{t('equipment.type')}</label>
                <select value={addType} onChange={e => setAddType(e.target.value)} className="form-select">
                  {EQUIPMENT_TYPES.filter(t => t !== 'All').map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div><label className="block text-sm text-[var(--color-on-surface-variant)] mb-1">{t('equipment.dailyRate')}</label><input type="number" value={addRate} onChange={e => setAddRate(e.target.value)} className="form-input" required /></div>
              <div><label className="block text-sm text-[var(--color-on-surface-variant)] mb-1">{t('equipment.location')}</label><input value={addLocation} onChange={e => setAddLocation(e.target.value)} className="form-input" required /></div>
              <div><label className="block text-sm text-[var(--color-on-surface-variant)] mb-1">{t('equipment.description')}</label><textarea value={addDesc} onChange={e => setAddDesc(e.target.value)} className="form-input" rows={3}></textarea></div>
              <PrimaryButton type="submit" loading={addLoading} className="w-full py-2.5 text-center">{t('equipment.listEquipment')}</PrimaryButton>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
