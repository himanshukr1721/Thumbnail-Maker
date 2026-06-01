import { motion } from 'framer-motion'
import { HiDownload, HiDuplicate, HiRefresh } from 'react-icons/hi'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ThumbnailCardProps {
  imageUrl: string
  styleName: string
  prompt?: string
  index?: number
  onDownload?: () => void
  onCopyPrompt?: () => void
  onRegenerate?: () => void
  className?: string
}

export function ThumbnailCard({
  imageUrl,
  styleName,
  prompt,
  index = 0,
  onDownload,
  onCopyPrompt,
  onRegenerate,
  className,
}: ThumbnailCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.45 }}
      whileHover={{ y: -4 }}
      className={cn(
        'group relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/50 shadow-xl shadow-black/30',
        className,
      )}
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={imageUrl}
          alt={`${styleName} thumbnail`}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 flex items-end justify-between gap-2 bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="rounded-full bg-brand/20 px-3 py-1 text-xs font-medium capitalize text-brand-light backdrop-blur">
            {styleName}
          </span>
          <div className="flex gap-1">
            {onDownload && (
              <Button variant="secondary" size="icon" onClick={onDownload} title="Download">
                <HiDownload className="h-4 w-4" />
              </Button>
            )}
            {onCopyPrompt && (
              <Button variant="secondary" size="icon" onClick={onCopyPrompt} title="Copy prompt">
                <HiDuplicate className="h-4 w-4" />
              </Button>
            )}
            {onRegenerate && (
              <Button variant="secondary" size="icon" onClick={onRegenerate} title="Regenerate">
                <HiRefresh className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
      {prompt && (
        <p className="line-clamp-2 px-4 py-3 text-xs text-zinc-500">{prompt}</p>
      )}
    </motion.article>
  )
}
