import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg'
  label?: string
  className?: string
}

const sizes = { sm: 'h-8 w-8', md: 'h-12 w-12', lg: 'h-16 w-16' }

export function Loader({ size = 'md', label, className }: LoaderProps) {
  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      <div className={cn('relative', sizes[size])}>
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-brand/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-brand border-r-brand-light"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-2 rounded-full bg-brand/20 blur-sm"
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </div>
      {label && (
        <motion.p
          className="text-sm text-zinc-400"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {label}
        </motion.p>
      )}
    </div>
  )
}
