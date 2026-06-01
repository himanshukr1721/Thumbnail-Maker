import { motion } from 'framer-motion'
import { HiArrowRight } from 'react-icons/hi'
import { TEMPLATE_PROMPTS } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface TemplatesSectionProps {
  onSelectTemplate: (prompt: string) => void
}

export function TemplatesSection({ onSelectTemplate }: TemplatesSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="font-display text-3xl font-bold text-cream">Templates</h1>
        <p className="mt-2 text-zinc-400">
          Jump-start your creativity with proven thumbnail prompt formulas
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATE_PROMPTS.map((template, i) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ y: -4 }}
          >
            <Card className="glow-border-hover h-full transition hover:border-brand/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{template.title}</CardTitle>
                  <span className="rounded-full bg-brand/15 px-2.5 py-0.5 text-xs font-medium text-brand-light">
                    {template.tag}
                  </span>
                </div>
                <CardDescription className="line-clamp-3">{template.prompt}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full group"
                  onClick={() => onSelectTemplate(template.prompt)}
                >
                  Use template
                  <HiArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
