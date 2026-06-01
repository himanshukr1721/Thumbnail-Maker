import { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Navbar } from '@/components/Navbar'
import { Sidebar } from '@/components/Sidebar'
import { HeroSection } from '@/components/sections/HeroSection'
import { Dashboard } from '@/components/sections/Dashboard'
import { RecentGenerations } from '@/components/sections/RecentGenerations'
import { TemplatesSection } from '@/components/sections/TemplatesSection'
import { SettingsPanel } from '@/components/SettingsPanel'
import { ProfileSection } from '@/components/sections/ProfileSection'
import { useSettings } from '@/hooks/useSettings'
import { useRecentGenerations } from '@/hooks/useRecentGenerations'
import type { ViewId } from '@/types'

function App() {
  const [activeView, setActiveView] = useState<ViewId>('landing')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dashboardPrompt, setDashboardPrompt] = useState('')
  const { settings, updateSettings } = useSettings()
  const { recent, addGenerations, removeGeneration, clearAll } = useRecentGenerations()

  const showAppShell = activeView !== 'landing'

  const navigate = useCallback((view: ViewId) => {
    setActiveView(view)
    if (view !== 'landing') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [])

  const handleTemplateSelect = (prompt: string) => {
    setDashboardPrompt(prompt)
    navigate('dashboard')
  }

  const pageVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
  }

  return (
    <div className="min-h-svh bg-surface">
      <Navbar
        activeView={activeView}
        onNavigate={navigate}
        showMenu={showAppShell}
        onMenuClick={() => setSidebarOpen(true)}
      />

      {activeView === 'landing' && (
        <HeroSection onGetStarted={() => navigate('dashboard')} />
      )}

      {showAppShell && (
        <div className="flex min-h-[calc(100svh-4rem)]">
          <Sidebar
            activeView={activeView}
            onNavigate={navigate}
            mobileOpen={sidebarOpen}
            onMobileClose={() => setSidebarOpen(false)}
          />
          <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="mx-auto max-w-6xl"
              >
                {activeView === 'dashboard' && (
                  <Dashboard
                    settings={settings}
                    initialPrompt={dashboardPrompt}
                    onGenerationsComplete={addGenerations}
                  />
                )}
                {activeView === 'recent' && (
                  <RecentGenerations
                    items={recent}
                    onClear={clearAll}
                    onRemove={removeGeneration}
                    onUsePrompt={(p) => {
                      if (p) setDashboardPrompt(p)
                      navigate('dashboard')
                    }}
                    onGoToDashboard={() => navigate('dashboard')}
                  />
                )}
                {activeView === 'templates' && (
                  <TemplatesSection onSelectTemplate={handleTemplateSelect} />
                )}
                {activeView === 'settings' && (
                  <SettingsPanel settings={settings} onUpdate={updateSettings} />
                )}
                {activeView === 'profile' && <ProfileSection />}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      )}

      {activeView === 'landing' && (
        <footer className="border-t border-white/5 px-6 py-8 text-center text-sm text-zinc-600">
          <p>ThumbForge — AI Thumbnail Generator</p>
          <p className="mt-1 text-xs">Built with React, Vite, and FastAPI</p>
        </footer>
      )}
    </div>
  )
}

export default App
