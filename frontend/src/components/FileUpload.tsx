import { useCallback, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiOutlinePhotograph, HiX } from 'react-icons/hi'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  file: File | null
  previewUrl: string | null
  onFileChange: (file: File | null, previewUrl: string | null) => void
  className?: string
}

export function FileUpload({ file, previewUrl, onFileChange, className }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFile = useCallback(
    (selected: File | null) => {
      if (!selected) {
        onFileChange(null, null)
        return
      }
      if (!selected.type.startsWith('image/')) return
      const url = URL.createObjectURL(selected)
      onFileChange(selected, url)
    },
    [onFileChange],
  )

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFile(dropped)
  }

  return (
    <div className={cn('space-y-2', className)}>
      <p className="text-sm font-medium text-cream">Headshot upload</p>
      <motion.div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        whileHover={{ scale: 1.01 }}
        className={cn(
          'relative flex min-h-[140px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300',
          dragOver
            ? 'border-brand bg-brand/10'
            : 'border-white/15 bg-zinc-900/30 hover:border-brand/40 hover:bg-brand/5',
          previewUrl && 'border-solid border-brand/30',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
        <AnimatePresence mode="wait">
          {previewUrl ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative h-full w-full"
            >
              <img
                src={previewUrl}
                alt="Headshot preview"
                className="h-36 w-full object-cover"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleFile(null)
                }}
                className="absolute right-2 top-2 rounded-full bg-zinc-950/80 p-1.5 text-zinc-300 hover:text-cream"
              >
                <HiX className="h-4 w-4" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-2 p-6 text-center"
            >
              <HiOutlinePhotograph className="h-8 w-8 text-brand/70" />
              <p className="text-sm text-zinc-300">Drop your headshot or click to browse</p>
              <p className="text-xs text-zinc-500">PNG, JPG up to 10MB</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      {file && (
        <p className="truncate text-xs text-zinc-500">{file.name}</p>
      )}
    </div>
  )
}
