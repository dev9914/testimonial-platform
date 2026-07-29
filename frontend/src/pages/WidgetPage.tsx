import { useState } from 'react'
import WidgetPreview from '../components/WidgetPreview'
import WidgetCodeGenerator, {
  type WidgetConfig,
} from '../components/WidgetCodeGenerator'

const DEFAULT_CONFIG: WidgetConfig = {
  width: 500,
  height: 760,
  theme: 'light',
  borderRadius: 12,
  showRating: true,
  showCompany: true,
}

export default function WidgetPage() {
  const [config, setConfig] = useState<WidgetConfig>(DEFAULT_CONFIG)

  return (
    <div className="py-6 pb-16">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-3">
          Widget Generator
        </h1>
        <p className="text-base text-slate-600 max-w-2xl">
          Customize your testimonial widget, preview it in real-time, then copy the iframe
          snippet to embed on any website.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 order-2 lg:order-1">
          <WidgetCodeGenerator config={config} onChange={setConfig} />
        </div>
        <div className="lg:col-span-2 order-1 lg:order-2 lg:sticky lg:top-6 lg:self-start">
          <WidgetPreview config={config} />
        </div>
      </div>
    </div>
  )
}
