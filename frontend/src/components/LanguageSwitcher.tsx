import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe, Check, X } from 'lucide-react'
import { languages } from '../i18n'

export default function LanguageSwitcher({ mode = 'icon' }: { mode?: 'icon' | 'full' }) {
  const { i18n, t } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0]

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code)
    localStorage.setItem('kissan-mitra-lang', code)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      {mode === 'icon' ? (
        <button
          onClick={() => setOpen(!open)}
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-transparent border border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors cursor-pointer"
          title={t('language.select')}
        >
          <Globe size={16} />
        </button>
      ) : (
        <button
          onClick={() => setOpen(!open)}
          className="w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all border border-[var(--color-outline-variant)] bg-transparent text-[var(--color-on-surface-variant)] hover:border-[var(--color-primary)] cursor-pointer flex items-center gap-2"
        >
          <Globe size={14} />
          <span className="truncate">{currentLang.flag} {currentLang.nativeLabel}</span>
        </button>
      )}

      {open && (
        <>
          {/* Mobile: full-screen backdrop */}
          <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setOpen(false)} />

          {/* Mobile: bottom sheet | Desktop: dropdown */}
          <div className={`fixed bottom-0 left-0 right-0 z-50 md:absolute md:bottom-auto md:top-full md:mt-2 md:w-80 ${mode === 'full' ? 'md:left-0 md:right-auto' : 'md:right-0 md:left-auto'}`}>
            <div className="bg-white border border-[var(--color-outline-variant)] rounded-t-2xl md:rounded-2xl shadow-lg max-h-[60vh] md:max-h-[80vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-outline-variant)] flex-shrink-0">
                <h3 className="text-sm font-semibold text-[var(--color-on-surface)]">{t('language.select')}</h3>
                <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-full hover:bg-[var(--color-surface-variant)] flex items-center justify-center bg-transparent border-none cursor-pointer md:hidden">
                  <X size={16} />
                </button>
              </div>

              {/* Language grid - scrollable */}
              <div className="overflow-y-auto p-2">
                <div className="grid grid-cols-2 gap-1">
                  {languages.map(lang => {
                    const isActive = i18n.language === lang.code
                    return (
                      <button
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className={`px-3 py-2.5 rounded-xl text-left text-sm transition-all border-none cursor-pointer flex items-center gap-2 min-w-0 ${
                          isActive
                            ? 'bg-[var(--color-primary-container)] text-[var(--color-primary)] font-semibold'
                            : 'bg-transparent text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-variant)]'
                        }`}
                      >
                        <span className="text-base flex-shrink-0">{lang.flag}</span>
                        <span className="flex-1 truncate text-xs sm:text-sm">{lang.nativeLabel}</span>
                        {isActive && <Check size={12} className="text-[var(--color-primary)] flex-shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
