import { motion } from 'framer-motion'
import { HiArrowRight, HiLightningBolt } from 'react-icons/hi'
import { Button } from '@/components/ui/button'
import { SHOWCASE_THUMBNAILS } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface HeroSectionProps {
  onGetStarted: () => void
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden px-4 pb-24 pt-12 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
      <motion.div
        className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-brand/20 blur-[120px]"
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pointer-events-none absolute -right-20 top-40 h-80 w-80 rounded-full bg-cream/10 blur-[100px]"
        animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5 text-xs font-medium text-brand-light"
            >
              <HiLightningBolt className="h-3.5 w-3.5" />
              AI-powered YouTube thumbnails
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl"
            >
              <span className="text-cream">Thumbnails that </span>
              <span className="text-gradient">stop the scroll</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 max-w-lg text-lg leading-relaxed text-zinc-400"
            >
              Generate cinematic, vibrant, and minimalist thumbnails in seconds.
              Upload your headshot, describe your vision, and let AI craft click-worthy art.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <Button size="lg" onClick={onGetStarted} className="group">
                Start generating
                <HiArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Button>
              <Button variant="outline" size="lg" onClick={onGetStarted}>
                View dashboard
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-10 flex gap-8"
            >
              {[
                { value: '3', label: 'Style variants' },
                { value: '<30s', label: 'Generation time' },
                { value: '4K', label: 'Export ready' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-2xl font-bold text-cream">{stat.value}</p>
                  <p className="text-xs text-zinc-500">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-3">
              {SHOWCASE_THUMBNAILS.map((thumb, i) => (
                <motion.div
                  key={thumb.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.08 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className={cn(
                    'group relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl',
                    i === 0 && 'col-span-2',
                  )}
                >
                  <img
                    src={thumb.url}
                    alt={thumb.title}
                    className="aspect-video w-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950/80 p-3 opacity-0 transition group-hover:opacity-100">
                    <p className="text-xs font-medium text-cream">{thumb.title}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-br from-brand/20 via-transparent to-cream/5 blur-2xl" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
