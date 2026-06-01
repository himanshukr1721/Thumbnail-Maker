import { motion } from 'framer-motion'
import { HiSparkles } from 'react-icons/hi'
import { cn } from '@/lib/utils'

interface PromptInputProps {
  value: string
  onChange: (value: string) => void
  maxLength?: number
  placeholder?: string
  className?: string
}

export function PromptInput({
  value,
  onChange,
  maxLength = 500,
  placeholder = 'Describe your thumbnail vision — expressions, colors, text overlays, mood...',
  className,
}: PromptInputProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('relative', className)}
    >
      <div className="mb-2 flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium text-cream">
          <HiSparkles className="h-4 w-4 text-brand" />
          Prompt
        </label>
        <span className="text-xs text-zinc-500">
          {value.length}/{maxLength}
        </span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
        placeholder={placeholder}
        rows={5}
        className="glass glow-border-hover w-full resize-none rounded-2xl border border-white/10 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 transition focus:border-brand/50 focus:outline-none focus:ring-2 focus:ring-brand/20"
      />
    </motion.div>
  )
}
