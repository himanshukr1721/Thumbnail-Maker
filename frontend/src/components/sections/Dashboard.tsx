import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiSparkles } from 'react-icons/hi'
import { uploadHeadshot, createjob, subscribeToJob } from '@/api'
import { parseHeadshotUrl, parseJobId, downloadImage } from '@/lib/api-helpers'
import { ASPECT_RATIOS, STYLE_OPTIONS } from '@/lib/constants'
import { PromptInput } from '@/components/PromptInput'
import { FileUpload } from '@/components/FileUpload'
import { ThumbnailCard } from '@/components/ThumbnailCard'
import { Loader } from '@/components/Loader'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { AppSettings, AspectRatio, GeneratedThumbnail, ThumbnailReadyEvent, ThumbnailStyle } from '@/types'

interface DashboardProps {
  settings: AppSettings
  onGenerationsComplete: (items: GeneratedThumbnail[]) => void
  initialPrompt?: string
}

interface LiveThumbnail {
  id: string
  styleName: string
  imageUrl: string
}

export function Dashboard({
  settings,
  onGenerationsComplete,
  initialPrompt = '',
}: DashboardProps) {
  const [prompt, setPrompt] = useState(initialPrompt)

  useEffect(() => {
    if (initialPrompt) setPrompt(initialPrompt)
  }, [initialPrompt])
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9')
  const [selectedStyle, setSelectedStyle] = useState<ThumbnailStyle>('vibrant')
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<LiveThumbnail[]>([])
  const eventSourceRef = useRef<EventSource | null>(null)
  const generatingRef = useRef(false)
  const cachedHeadshotRef = useRef<{ key: string; url: string } | null>(null)

  const handleGenerate = useCallback(async () => {
    if (generatingRef.current) return
    if (!prompt.trim()) {
      setError('Please enter a prompt')
      return
    }
    if (!file) {
      setError('Please upload a headshot image')
      return
    }

    generatingRef.current = true
    setError(null)
    setLoading(true)
    setResults([])
    eventSourceRef.current?.close()

    try {
      const fileKey = `${file.name}-${file.size}-${file.lastModified}`
      let headshotUrl: string
      if (cachedHeadshotRef.current?.key === fileKey) {
        headshotUrl = cachedHeadshotRef.current.url
      } else {
        const uploadData = await uploadHeadshot(file)
        headshotUrl = parseHeadshotUrl(uploadData)
        cachedHeadshotRef.current = { key: fileKey, url: headshotUrl }
      }

      const jobData = await createjob({
        prompt: prompt.trim(),
        headshotUrl,
        styleName: selectedStyle,
      })
      const jobId = parseJobId(jobData)

      const collected: LiveThumbnail[] = []

      const evtSource = await subscribeToJob(jobId, {
        onThumbnailReady: (data: ThumbnailReadyEvent) => {
          const thumb: LiveThumbnail = {
            id: String(data.thumbnail_id),
            styleName: data.style_name,
            imageUrl: data.imagekit_url,
          }
          collected.push(thumb)
          setResults((prev) => [...prev, thumb])
        },
        onThumbnailFailed: (data: { error?: string; style_name?: string }) => {
          generatingRef.current = false
          setLoading(false)
          const msg = data?.error ?? 'Thumbnail generation failed'
          setError(
            data?.style_name ? `${data.style_name}: ${msg}` : msg,
          )
        },
        onJobComplete: () => {
          generatingRef.current = false
          setLoading(false)
          const generated: GeneratedThumbnail[] = collected.map((t) => ({
            id: t.id,
            styleName: t.styleName,
            imageUrl: t.imageUrl,
            prompt: prompt.trim(),
            createdAt: new Date().toISOString(),
            aspectRatio,
          }))
          onGenerationsComplete(generated)
        },
        OnError: () => {
          generatingRef.current = false
          if (collected.length > 0) {
            setLoading(false)
            onGenerationsComplete(
              collected.map((t) => ({
                id: t.id,
                styleName: t.styleName,
                imageUrl: t.imageUrl,
                prompt: prompt.trim(),
                createdAt: new Date().toISOString(),
                aspectRatio,
              })),
            )
          } else {
            setLoading(false)
            setError('Connection lost. Check that the backend is running.')
          }
        },
      })

      eventSourceRef.current = evtSource
    } catch (err) {
      setLoading(false)
      setError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      generatingRef.current = false
    }
  }, [prompt, file, selectedStyle, aspectRatio, onGenerationsComplete])

  const copyPrompt = () => {
    navigator.clipboard.writeText(prompt)
  }

  const handleRegenerate = () => {
    handleGenerate()
  }

  const previewImage = results[0]?.imageUrl

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold text-cream">Generator</h1>
        <p className="mt-2 text-zinc-400">
          Craft scroll-stopping thumbnails with AI — {settings.quality} quality at {settings.resolution}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid gap-8 xl:grid-cols-[1fr_380px]"
      >
        <div className="space-y-6">
          <PromptInput value={prompt} onChange={setPrompt} />

          <div>
            <p className="mb-3 text-sm font-medium text-cream">Style</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {STYLE_OPTIONS.map((style, i) => {
                const selected = selectedStyle === style.id
                return (
                  <motion.button
                    key={style.id}
                    type="button"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedStyle(style.id)}
                    className={cn(
                      'relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300',
                      selected
                        ? 'glow-border border-brand/50 bg-brand/10'
                        : 'border-white/10 bg-zinc-900/40 hover:border-white/20',
                    )}
                  >
                    <div className={cn('absolute inset-0 bg-gradient-to-br opacity-40', style.gradient)} />
                    <div className="relative">
                      <p className="font-medium text-cream">{style.label}</p>
                      <p className="mt-1 text-xs text-zinc-400">{style.description}</p>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-cream">Aspect ratio</p>
            <div className="flex flex-wrap gap-2">
              {ASPECT_RATIOS.map((ratio) => (
                <button
                  key={ratio.id}
                  type="button"
                  onClick={() => setAspectRatio(ratio.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition',
                    aspectRatio === ratio.id
                      ? 'bg-brand text-zinc-950'
                      : 'glass text-zinc-400 hover:text-cream',
                  )}
                >
                  <span className="text-lg opacity-60">{ratio.icon}</span>
                  {ratio.label}
                  <span className="text-xs opacity-50">{ratio.id}</span>
                </button>
              ))}
            </div>
          </div>

          <FileUpload
            file={file}
            previewUrl={previewUrl}
            onFileChange={(f, url) => {
              setFile(f)
              setPreviewUrl(url)
            }}
          />

          {error && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          <Button
            size="lg"
            className="w-full sm:w-auto"
            disabled={loading}
            onClick={handleGenerate}
          >
            <HiSparkles className="h-5 w-5" />
            {loading ? 'Generating...' : 'Generate thumbnail'}
          </Button>
        </div>

        <div className="glass glow-border sticky top-24 h-fit rounded-3xl p-4">
          <p className="mb-3 text-sm font-medium text-cream">Preview</p>
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-2xl bg-zinc-900/50 py-12"
              >
                <Loader label="Creating magic..." />
              </motion.div>
            ) : previewImage ? (
              <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <img
                  src={previewImage}
                  alt="Preview"
                  className="aspect-video w-full rounded-2xl object-cover"
                />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-white/10 bg-zinc-900/30"
              >
                <p className="text-sm text-zinc-500">Your thumbnail will appear here</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <div>
        <h2 className="mb-4 font-display text-xl font-semibold text-cream">Generated thumbnail</h2>
        {loading && results.length === 0 ? (
          <Skeleton className="aspect-video w-full max-w-2xl" />
        ) : results.length > 0 ? (
          <div className="max-w-2xl">
            {results.map((thumb, i) => (
              <ThumbnailCard
                key={thumb.id}
                imageUrl={thumb.imageUrl}
                styleName={thumb.styleName}
                prompt={prompt}
                index={i}
                onDownload={() =>
                  downloadImage(thumb.imageUrl, `thumbnail-${thumb.styleName}.png`)
                }
                onCopyPrompt={copyPrompt}
                onRegenerate={handleRegenerate}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">Generate a thumbnail to see results here</p>
        )}
      </div>
    </div>
  )
}
