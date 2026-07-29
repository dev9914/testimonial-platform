import { useEffect, useState } from "react"
import Card, {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./Card"
import { buildEmbedSrc, type WidgetConfig } from "./WidgetCodeGenerator"

interface WidgetPreviewProps {
  config: WidgetConfig
}

export default function WidgetPreview({ config }: WidgetPreviewProps) {
  const src = buildEmbedSrc(config)
  const [key, setKey] = useState(0)

  useEffect(() => {
    setKey((k) => k + 1)
  }, [src])

  // Preview should never become absurdly tall.
  // The generated embed snippet still uses config.height.
  const previewHeight = Math.min(config.height, 700)

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Live Preview</CardTitle>
        <CardDescription>
          This preview shows exactly how the widget will appear when embedded on
          another website.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="rounded-2xl border bg-slate-50 p-5">
          {/* Fake browser frame */}
          <div className="mb-4 flex items-center gap-2 border-b pb-4">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-yellow-400" />
            <div className="h-3 w-3 rounded-full bg-green-400" />

            <div className="ml-4 flex-1 rounded-md bg-white px-3 py-1 text-xs text-slate-400 shadow-sm">
              Embedded Widget Preview
            </div>
          </div>

          {/* Widget Preview */}
          <div className="flex justify-center">
            <div
              className="overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200"
              style={{
                width: Math.min(config.width, 520),
                maxWidth: "100%",
                borderRadius: `${config.borderRadius}px`,
              }}
            >
              <iframe
                key={key}
                title="Testimonial Widget Preview"
                src={src}
                width="100%"
                height={previewHeight}
                frameBorder={0}
                loading="lazy"
                allowFullScreen
                style={{
                  display: "block",
                  width: "100%",
                  height: previewHeight,
                  border: "none",
                  background: "#fff",
                  borderRadius: `${config.borderRadius}px`,
                }}
              />
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-slate-500">
            The widget uses its own scrollbar when content exceeds the selected
            height. This is the same behavior users will see after embedding it
            on their website.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}