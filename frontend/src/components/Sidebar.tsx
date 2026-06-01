import { AnimatePresence, motion } from 'framer-motion'
import {
  HiOutlineTemplate,
  HiOutlineClock,
  HiOutlineCog,
  HiOutlineViewGrid,
  HiOutlineUser,
} from 'react-icons/hi'
import { cn } from '@/lib/utils'
import type { ViewId } from '@/types'

interface SidebarProps {
  activeView: ViewId
  onNavigate: (view: ViewId) => void
  mobileOpen?: boolean
  onMobileClose?: () => void
}

const items: { id: ViewId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: HiOutlineViewGrid },
  { id: 'recent', label: 'Recent Generations', icon: HiOutlineClock },
  { id: 'templates', label: 'Templates', icon: HiOutlineTemplate },
  { id: 'settings', label: 'Settings', icon: HiOutlineCog },
  { id: 'profile', label: 'Profile', icon: HiOutlineUser },
]

function SidebarContent({
  activeView,
  onNavigate,
  onMobileClose,
}: Pick<SidebarProps, 'activeView' | 'onNavigate' | 'onMobileClose'>) {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-white/5 bg-zinc-950/90 p-4 backdrop-blur-xl">
      <p className="mb-6 px-3 text-xs font-medium uppercase tracking-widest text-zinc-500">
        Workspace
      </p>
      <nav className="flex flex-1 flex-col gap-1">
        {items.map((item) => {
          const Icon = item.icon
          const active = activeView === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onNavigate(item.id)
                onMobileClose?.()
              }}
              className={cn(
                'group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-300',
                active
                  ? 'glow-border bg-brand/10 text-brand-light'
                  : 'text-zinc-400 hover:bg-white/5 hover:text-cream',
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5 transition-colors',
                  active ? 'text-brand' : 'text-zinc-500 group-hover:text-brand-light',
                )}
              />
              {item.label}
            </button>
          )
        })}
      </nav>
      <div className="mt-auto rounded-2xl border border-brand/20 bg-gradient-to-br from-brand/10 to-transparent p-4">
        <p className="text-xs font-medium text-brand-light">Pro tip</p>
        <p className="mt-1 text-xs leading-relaxed text-zinc-400">
          Upload a clear headshot for best face consistency across styles.
        </p>
      </div>
    </aside>
  )
}

export function Sidebar({ activeView, onNavigate, mobileOpen, onMobileClose }: SidebarProps) {
  return (
    <>
      <div className="hidden lg:block">
        <SidebarContent
          activeView={activeView}
          onNavigate={onNavigate}
          onMobileClose={onMobileClose}
        />
      </div>
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={onMobileClose}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed inset-y-0 left-0 z-50 lg:hidden"
            >
              <SidebarContent
                activeView={activeView}
                onNavigate={onNavigate}
                onMobileClose={onMobileClose}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
