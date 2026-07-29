import { useEffect, useMemo, useState } from 'react'
import Card, {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './Card'
import { Input } from './Input'
import { Button } from './Button'
import { useToast } from '../context/ToastContext'

export interface WidgetConfig {
  width: number
  height: number
  theme: 'light' | 'dark'
  borderRadius: number
  showRating: boolean
  showCompany: boolean
}

interface WidgetCodeGeneratorProps {
  config: WidgetConfig
  onChange: (next: WidgetConfig) => void
}

function buildEmbedSrc(config: WidgetConfig, baseOrigin?: string): string {
  const origin =
    baseOrigin ||
    (typeof window !== 'undefined' && typeof window.location?.origin === 'string'
      ? window.location.origin
      : typeof import.meta.env?.VITE_PUBLIC_FRONTEND_URL === 'string' && import.meta.env.VITE_PUBLIC_FRONTEND_URL.length > 0
        ? import.meta.env.VITE_PUBLIC_FRONTEND_URL
        : '');
  if (!origin) {
    throw new Error('Unable to determine frontend origin. Set VITE_PUBLIC_FRONTEND_URL when running outside a browser.');
  }
  const params = new URLSearchParams()
  params.set('theme', config.theme)
  params.set('rating', String(config.showRating))
  params.set('company', String(config.showCompany))
  if (config.borderRadius !== 12) params.set('borderRadius', String(config.borderRadius))
  return `${origin}/embed?${params.toString()}`
}

function buildIframeCode(config: WidgetConfig, baseOrigin?: string): string {
  const src = buildEmbedSrc(config, baseOrigin)
  return `<iframe src="${src}" width="${config.width}" height="${config.height}" frameborder="0" style="border:0;border-radius:${config.borderRadius}px;" allowfullscreen loading="lazy" title="Testimonials"></iframe>`
}

export default function WidgetCodeGenerator({
  config,
  onChange,
}: WidgetCodeGeneratorProps) {
  const { pushToast } = useToast()
  const [copied, setCopied] = useState(false)

  const iframeCode = useMemo(() => buildIframeCode(config), [config])

  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(t)
  }, [copied])

  const update = <K extends keyof WidgetConfig>(key: K, value: WidgetConfig[K]) => {
    onChange({ ...config, [key]: value })
  }

  const onCopy = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(iframeCode)
      } else {
        const ta = document.createElement('textarea')
        ta.value = iframeCode
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      }
      setCopied(true)
      pushToast('success', 'Iframe snippet copied to clipboard.')
    } catch (err) {
      pushToast('error', 'Failed to copy to clipboard.')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>Tweak the widget to match your site.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input
            type="number"
            label="Width (px)"
            min={240}
            max={1600}
            value={String(config.width)}
            onChange={(e) => update('width', Math.max(240, Math.min(1600, Number(e.target.value) || 500)))}
          />
          <Input
            type="number"
            label="Height (px)"
            min={200}
            max={2000}
            value={String(config.height)}
            onChange={(e) => update('height', Math.max(200, Math.min(2000, Number(e.target.value) || 600)))}
          />

          <div>
            <label className="block font-medium text-sm text-slate-700 mb-1.5">Theme</label>
            <div className="flex gap-2">
              {(['light', 'dark'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => update('theme', t)}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors border ${
                    config.theme === t
                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <Input
            type="number"
            label="Border Radius (px)"
            min={0}
            max={48}
            value={String(config.borderRadius)}
            onChange={(e) => update('borderRadius', Math.max(0, Math.min(48, Number(e.target.value) || 0)))}
          />

          <ToggleRow
            label="Show Rating"
            checked={config.showRating}
            onChange={(v) => update('showRating', v)}
          />
          <ToggleRow
            label="Show Company"
            checked={config.showCompany}
            onChange={(v) => update('showCompany', v)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Embed Snippet</CardTitle>
              <CardDescription>Paste this HTML anywhere on your website.</CardDescription>
            </div>
            <Button
              variant={copied ? 'success' : 'primary'}
              size="sm"
              onClick={onCopy}
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Copied
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                  </svg>
                  Copy
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <pre
            className={`
              bg-slate-900 text-slate-100
              rounded-lg p-4
              text-xs sm:text-sm
              overflow-x-auto
              font-mono
              shadow-inner
              whitespace-pre-wrap break-words
              leading-relaxed
            `}
          >
            <code>{iframeCode}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-md px-3 py-2.5 sm:col-span-1">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-1 ${
          checked ? 'bg-blue-600' : 'bg-slate-300'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}

export { buildIframeCode, buildEmbedSrc }
