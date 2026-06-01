export type ViewId =
  | 'landing'
  | 'dashboard'
  | 'recent'
  | 'templates'
  | 'settings'
  | 'profile'

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3'

export type ThumbnailStyle = 'vibrant' | 'minimalist' | 'cinematic'

export interface GeneratedThumbnail {
  id: string
  styleName: string
  imageUrl: string
  prompt: string
  createdAt: string
  aspectRatio: AspectRatio
}

export interface AppSettings {
  theme: 'dark' | 'light'
  quality: 'standard' | 'hd' | 'ultra'
  resolution: '720p' | '1080p' | '4k'
}

export interface ThumbnailReadyEvent {
  thumbnail_id: number
  style_name: string
  imagekit_url: string
  variants?: Record<string, string>
}
