import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { HiCheckCircle, HiXCircle } from 'react-icons/hi'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { AppSettings } from '@/types'

interface SettingsPanelProps {
  settings: AppSettings
  onUpdate: (patch: Partial<AppSettings>) => void
}

export function SettingsPanel({ settings, onUpdate }: SettingsPanelProps) {
  const [apiOnline, setApiOnline] = useState<boolean | null>(null)

  useEffect(() => {
    fetch('/api/jobs/health', { method: 'GET' })
      .then((r) => setApiOnline(r.ok || r.status === 404))
      .catch(() => setApiOnline(false))
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-2xl space-y-6"
    >
      <div>
        <h1 className="font-display text-3xl font-bold text-cream">Settings</h1>
        <p className="mt-2 text-zinc-400">Customize your generation experience</p>
      </div>

      <Card className="glow-border">
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Toggle between dark and light themes</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <Label htmlFor="theme-toggle">Dark mode</Label>
          <Switch
            id="theme-toggle"
            checked={settings.theme === 'dark'}
            onCheckedChange={(checked) =>
              onUpdate({ theme: checked ? 'dark' : 'light' })
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Status</CardTitle>
          <CardDescription>Connection to the FastAPI backend</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              'flex items-center gap-3 rounded-2xl border px-4 py-3',
              apiOnline === true && 'border-brand/30 bg-brand/10',
              apiOnline === false && 'border-red-500/30 bg-red-500/10',
              apiOnline === null && 'border-white/10 bg-zinc-800/50',
            )}
          >
            {apiOnline === true && (
              <>
                <HiCheckCircle className="h-5 w-5 text-brand" />
                <span className="text-sm text-brand-light">Backend connected</span>
              </>
            )}
            {apiOnline === false && (
              <>
                <HiXCircle className="h-5 w-5 text-red-400" />
                <span className="text-sm text-red-300">
                  Backend offline — start the FastAPI server on port 8080
                </span>
              </>
            )}
            {apiOnline === null && (
              <span className="text-sm text-zinc-400">Checking connection...</span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quality</CardTitle>
          <CardDescription>Output quality for generated thumbnails</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {(['standard', 'hd', 'ultra'] as const).map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => onUpdate({ quality: q })}
              className={cn(
                'rounded-xl px-4 py-2 text-sm font-medium capitalize transition',
                settings.quality === q
                  ? 'bg-brand text-zinc-950'
                  : 'bg-zinc-800/80 text-zinc-400 hover:text-cream',
              )}
            >
              {q}
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resolution</CardTitle>
          <CardDescription>Output resolution settings</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {(['720p', '1080p', '4k'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onUpdate({ resolution: r })}
              className={cn(
                'rounded-xl px-4 py-2 text-sm font-medium uppercase transition',
                settings.resolution === r
                  ? 'bg-brand text-zinc-950'
                  : 'bg-zinc-800/80 text-zinc-400 hover:text-cream',
              )}
            >
              {r}
            </button>
          ))}
        </CardContent>
      </Card>

    </motion.div>
  )
}