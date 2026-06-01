import type { ThumbnailStyle } from '@/types'

export const STYLE_OPTIONS: {
  id: ThumbnailStyle
  label: string
  description: string
  gradient: string
}[] = [
  {
    id: 'vibrant',
    label: 'Vibrant',
    description: 'Bold colors that pop off the feed',
    gradient: 'from-rose-500/30 via-amber-500/20 to-brand/30',
  },
  {
    id: 'minimalist',
    label: 'Minimalist',
    description: 'Clean lines and focused composition',
    gradient: 'from-zinc-500/30 via-slate-400/20 to-cream/10',
  },
  {
    id: 'cinematic',
    label: 'Cinematic',
    description: 'Dramatic lighting and movie-poster feel',
    gradient: 'from-indigo-600/30 via-purple-600/20 to-brand/20',
  },
]

export const ASPECT_RATIOS = [
  { id: '16:9' as const, label: 'YouTube', icon: '▭' },
  { id: '9:16' as const, label: 'Shorts', icon: '▯' },
  { id: '1:1' as const, label: 'Square', icon: '□' },
  { id: '4:3' as const, label: 'Classic', icon: '▬' },
]

export const TEMPLATE_PROMPTS = [
  {
    id: 'tech',
    title: 'Tech Review',
    prompt:
      'Shocked face close-up, neon blue glow, bold "INSANE!" text, product floating beside me, dark gradient background',
    tag: 'Popular',
  },
  {
    id: 'gaming',
    title: 'Gaming Highlight',
    prompt:
      'Epic victory moment, explosive particles, saturated reds and golds, dramatic rim light, championship energy',
    tag: 'Gaming',
  },
  {
    id: 'vlog',
    title: 'Travel Vlog',
    prompt:
      'Warm golden hour portrait, scenic destination blurred behind, curious expression, soft film grain, wanderlust mood',
    tag: 'Lifestyle',
  },
  {
    id: 'tutorial',
    title: 'How-To Tutorial',
    prompt:
      'Clean split layout, step numbers, bright green accent arrows, friendly smile, professional studio lighting',
    tag: 'Education',
  },
  {
    id: 'podcast',
    title: 'Podcast Episode',
    prompt:
      'Moody studio setup, microphone in frame, deep purple shadows, episode number badge, intimate conversation vibe',
    tag: 'Audio',
  },
  {
    id: 'finance',
    title: 'Finance Tips',
    prompt:
      'Confident pose, upward trending chart graphics, gold and emerald palette, luxury minimal aesthetic',
    tag: 'Business',
  },
]

export const SHOWCASE_THUMBNAILS = [
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1611162617474-5b21e039e986?w=640&h=360&fit=crop',
    title: 'Tech Breakdown',
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=640&h=360&fit=crop',
    title: 'Gaming Stream',
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=640&h=360&fit=crop',
    title: 'Travel Vlog',
  },
  {
    id: '4',
    url: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=640&h=360&fit=crop',
    title: 'Podcast Ep.',
  },
]
