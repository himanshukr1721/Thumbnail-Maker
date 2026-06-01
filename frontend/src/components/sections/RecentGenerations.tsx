import { motion } from 'framer-motion'
import { HiTrash } from 'react-icons/hi'
import { ThumbnailCard } from '@/components/ThumbnailCard'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/button'
import { downloadImage } from '@/lib/api-helpers'
import type { GeneratedThumbnail } from '@/types'

interface RecentGenerationsProps {
  items: GeneratedThumbnail[]
  onClear: () => void
  onRemove: (id: string) => void
  onUsePrompt: (prompt: string) => void
  onGoToDashboard: () => void
}

export function RecentGenerations({
  items,
  onClear,
  onRemove,
  onUsePrompt,
  onGoToDashboard,
}: RecentGenerationsProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="No generations yet"
        description="Your recently created thumbnails will appear here in a beautiful masonry grid."
        actionLabel="Start generating"
        onAction={onGoToDashboard}
      />
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-cream">Recent Generations</h1>
          <p className="mt-2 text-zinc-400">{items.length} thumbnails in your gallery</p>
        </div>
        <Button variant="outline" size="sm" onClick={onClear}>
          <HiTrash className="h-4 w-4" />
          Clear all
        </Button>
      </div>

      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {items.map((item, i) => (
          <div key={item.id} className="mb-4 break-inside-avoid">
            <ThumbnailCard
              imageUrl={item.imageUrl}
              styleName={item.styleName}
              prompt={item.prompt}
              index={i}
              onDownload={() =>
                downloadImage(item.imageUrl, `thumbforge-${item.styleName}.png`)
              }
              onCopyPrompt={() => navigator.clipboard.writeText(item.prompt)}
              onRegenerate={() => onUsePrompt(item.prompt)}
            />
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="mt-2 w-full text-center text-xs text-zinc-600 transition hover:text-red-400"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
