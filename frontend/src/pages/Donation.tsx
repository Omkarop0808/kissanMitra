import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Heart, QrCode, CreditCard, Smartphone, Sprout, Droplets, GraduationCap, CheckCircle, X } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import InputCard from '../components/InputCard'

const AMOUNTS = [500, 1000, 2500, 5000]

export default function Donation() {
  const { t } = useTranslation()
  const [donationType, setDonationType] = useState<'one-time' | 'monthly'>('one-time')
  const [amount, setAmount] = useState(1000)
  const [customAmount, setCustomAmount] = useState('')
  const [showQR, setShowQR] = useState(false)

  const effectiveAmount = customAmount ? parseInt(customAmount) : amount

  const handleUPI = () => {
    setShowQR(true)
  }

  const handleCard = () => {
    alert('Card payment integration coming soon. Please use UPI for now.')
  }

  const handlePaytm = () => {
    alert('Paytm payment integration coming soon. Please use UPI for now.')
  }

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=kissanmitra@upi&pn=Kissan Mitra&am=${effectiveAmount}&cu=INR&tn=Donation to Kissan Mitra`)}`

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <PageHeader icon={Heart} title={t('donation.title')} subtitle={t('donation.subtitle')} color="#ec4899" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <InputCard>
          {/* Type toggle */}
          <div className="flex rounded-xl overflow-hidden border border-[var(--color-outline-variant)] mb-6">
            <button
              onClick={() => setDonationType('one-time')}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors border-none cursor-pointer ${donationType === 'one-time' ? 'bg-[var(--color-primary)] text-white' : 'bg-transparent text-[var(--color-on-surface-variant)]'}`}
            >
              {t('donation.oneTime')}
            </button>
            <button
              onClick={() => setDonationType('monthly')}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors border-none cursor-pointer ${donationType === 'monthly' ? 'bg-[var(--color-primary)] text-white' : 'bg-transparent text-[var(--color-on-surface-variant)]'}`}
            >
              {t('donation.monthly')}
            </button>
          </div>

          {/* Amount buttons */}
          <p className="text-sm text-[var(--color-on-surface-variant)] mb-3">{t('donation.selectAmount')}</p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {AMOUNTS.map(a => (
              <button
                key={a}
                onClick={() => { setAmount(a); setCustomAmount('') }}
                className={`amount-btn ${amount === a && !customAmount ? 'active' : ''}`}
              >
                ₹{a.toLocaleString()}
              </button>
            ))}
          </div>
          <div className="mb-6">
            <input
              type="number"
              value={customAmount}
              onChange={e => setCustomAmount(e.target.value)}
              placeholder={t('donation.customAmount')}
              className="form-input"
              min="1"
            />
          </div>

          <div className="mb-4 bg-[var(--color-surface-variant)] rounded-xl p-3 text-center">
            <p className="text-sm text-[var(--color-on-surface-variant)]">{donationType === 'monthly' ? t('donation.monthly') : t('donation.oneTime')} {t('donation.donation')}</p>
            <p className="text-3xl font-bold text-[var(--color-primary)]">₹{effectiveAmount.toLocaleString()}</p>
          </div>

          {/* Payment buttons */}
          <div className="space-y-3">
            <button onClick={handleUPI} className="btn-primary w-full py-3 text-center flex items-center justify-center gap-2">
              <QrCode size={16} />{t('donation.payUPI')}
            </button>
            <button onClick={handleCard} className="btn-secondary w-full py-3 text-center flex items-center justify-center gap-2">
              <CreditCard size={16} />{t('donation.payCard')}
            </button>
            <button onClick={handlePaytm} className="btn-secondary w-full py-3 text-center flex items-center justify-center gap-2">
              <Smartphone size={16} />{t('donation.payPaytm')}
            </button>
          </div>
        </InputCard>

        {/* Impact */}
        <div>
          <InputCard className="mb-4">
            <h3 className="text-lg font-semibold mb-4 text-[var(--color-primary)]">{t('donation.impact')}</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-container)] flex items-center justify-center"><Sprout size={18} className="text-[var(--color-primary)]" /></div>
                <div><p className="font-medium text-[var(--color-on-surface)]">₹500</p><p className="text-sm text-[var(--color-on-surface-variant)]">{t('donation.impact1')}</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"><Droplets size={18} className="text-blue-500" /></div>
                <div><p className="font-medium text-[var(--color-on-surface)]">₹1,000</p><p className="text-sm text-[var(--color-on-surface-variant)]">{t('donation.impact2')}</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center"><GraduationCap size={18} className="text-purple-500" /></div>
                <div><p className="font-medium text-[var(--color-on-surface)]">₹2,500</p><p className="text-sm text-[var(--color-on-surface-variant)]">{t('donation.impact3')}</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center"><Heart size={18} className="text-pink-500" /></div>
                <div><p className="font-medium text-[var(--color-on-surface)]">₹5,000</p><p className="text-sm text-[var(--color-on-surface-variant)]">{t('donation.impact4')}</p></div>
              </div>
            </div>
          </InputCard>

          <InputCard>
            <h3 className="text-sm font-semibold mb-3 text-[var(--color-on-surface-variant)]">{t('donation.whyDonate')}</h3>
            <ul className="space-y-2 text-sm text-[var(--color-on-surface-variant)]">
              <li className="flex items-center gap-2"><CheckCircle size={14} className="text-[var(--color-primary)] flex-shrink-0" />{t('donation.reason1')}</li>
              <li className="flex items-center gap-2"><CheckCircle size={14} className="text-[var(--color-primary)] flex-shrink-0" />{t('donation.reason2')}</li>
              <li className="flex items-center gap-2"><CheckCircle size={14} className="text-[var(--color-primary)] flex-shrink-0" />{t('donation.reason3')}</li>
              <li className="flex items-center gap-2"><CheckCircle size={14} className="text-[var(--color-primary)] flex-shrink-0" />{t('donation.reason4')}</li>
            </ul>
          </InputCard>
        </div>
      </div>

      {/* QR Modal */}
      {showQR && (
        <div className="modal-overlay" onClick={() => setShowQR(false)}>
          <div className="modal-content text-center" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[var(--color-on-surface)]">{t('donation.scanToPay')}</h3>
              <button onClick={() => setShowQR(false)} className="w-8 h-8 rounded-full hover:bg-[var(--color-surface-variant)] flex items-center justify-center bg-transparent border-none cursor-pointer">
                <X size={18} className="text-[var(--color-on-surface-variant)]" />
              </button>
            </div>
            <p className="text-[var(--color-primary)] text-2xl font-bold mb-4">₹{effectiveAmount.toLocaleString()}</p>
            <img src={qrUrl} alt="UPI QR Code" className="mx-auto rounded-lg bg-white p-2" />
            <p className="text-sm text-[var(--color-on-surface-variant)] mt-4">{t('donation.scanHint')}</p>
          </div>
        </div>
      )}
    </div>
  )
}
