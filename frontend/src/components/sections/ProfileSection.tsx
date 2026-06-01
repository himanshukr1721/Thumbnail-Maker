import { motion } from 'framer-motion'
import { HiMail, HiUser } from 'react-icons/hi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function ProfileSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-lg space-y-6"
    >
      <div>
        <h1 className="font-display text-3xl font-bold text-cream">Profile</h1>
        <p className="mt-2 text-zinc-400">Manage your ThumbForge account</p>
      </div>

      <Card className="glow-border overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-brand/30 via-brand-dark/20 to-cream/10" />
        <CardHeader className="-mt-12 flex flex-row items-end gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-zinc-950 bg-gradient-to-br from-brand to-brand-dark shadow-xl">
            <HiUser className="h-10 w-10 text-zinc-950" />
          </div>
          <div className="pb-1">
            <CardTitle>Creator</CardTitle>
            <p className="text-sm text-zinc-500">Free plan</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl bg-zinc-800/50 px-4 py-3">
            <HiMail className="h-5 w-5 text-brand" />
            <span className="text-sm text-zinc-300">creator@thumbforge.app</span>
          </div>
          <Button variant="outline" className="w-full">
            Upgrade to Pro
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
