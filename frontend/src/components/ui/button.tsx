import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:pointer-events-none disabled:opacity-50 motion-safe:active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-brand text-zinc-950 shadow-lg shadow-brand/25 hover:bg-brand-light hover:shadow-brand/40',
        secondary:
          'glass text-cream hover:border-brand/40 hover:bg-zinc-800/60',
        outline:
          'border border-white/15 bg-transparent text-zinc-200 hover:border-brand/50 hover:bg-brand/10',
        ghost: 'text-zinc-300 hover:bg-white/5 hover:text-cream',
        destructive:
          'bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500/25',
      },
      size: {
        default: 'h-11 px-6',
        sm: 'h-9 rounded-xl px-4 text-xs',
        lg: 'h-12 rounded-2xl px-8 text-base',
        icon: 'h-10 w-10 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
