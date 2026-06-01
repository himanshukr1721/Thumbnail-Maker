import { motion } from 'framer-motion'
import { HiMenuAlt2 } from 'react-icons/hi'
import { FiGithub } from 'react-icons/fi'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ViewId } from '@/types'

interface NavbarProps {
  activeView: ViewId
  onNavigate: (view: ViewId) => void
  onMenuClick?: () => void
  showMenu?: boolean
}

const navLinks: { id: ViewId; label: string }[] = [
  { id: 'landing', label: 'Home' },
  { id: 'dashboard', label: 'Generator' },
  { id: 'recent', label: 'Gallery' },
  { id: 'templates', label: 'Templates' },
]

export function Navbar({ activeView, onNavigate, onMenuClick, showMenu }: NavbarProps) {
  const scrollTo = (id: ViewId) => {
    onNavigate(id)
    if (id === 'landing') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-40 border-b border-white/5 bg-zinc-950/70 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          {showMenu && (
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
              <HiMenuAlt2 className="h-5 w-5" />
            </Button>
          )}
          <button
            type="button"
            onClick={() => scrollTo('landing')}
            className="group flex items-center gap-2.5"
          >
            <motion.div
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-dark shadow-lg shadow-brand/30"
              whileHover={{ scale: 1.05 }}
            >
              <span className="font-display text-sm font-bold text-zinc-950">TF</span>
            </motion.div>
            <span className="font-display text-lg font-semibold tracking-tight text-cream">
              Thumb<span className="text-brand">Forge</span>
            </span>
          </button>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => scrollTo(link.id)}
              className={cn(
                'rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300',
                activeView === link.id
                  ? 'bg-brand/15 text-brand-light'
                  : 'text-zinc-400 hover:bg-white/5 hover:text-cream',
              )}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="ghost" size="icon" asChild className="hidden sm:inline-flex">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <FiGithub className="h-5 w-5" />
            </a>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="hidden sm:inline-flex"
            onClick={() => onNavigate('settings')}
          >
            Settings
          </Button>
          <button
            type="button"
            onClick={() => onNavigate('profile')}
            className="glow-border-hover flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-brand/30 bg-gradient-to-br from-brand/30 to-zinc-800 transition hover:scale-105"
          >
            <span className="font-display text-xs font-bold text-cream">AI</span>
          </button>
        </div>
      </div>
    </motion.header>
  )
}
