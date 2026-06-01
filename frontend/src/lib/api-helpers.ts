export function parseHeadshotUrl(data: unknown): string {
  if (typeof data === 'string') return data
  if (data && typeof data === 'object' && 'url' in data) {
    return String((data as { url: string }).url)
  }
  throw new Error('Invalid headshot upload response')
}

export function parseJobId(data: unknown): string {
  if (typeof data === 'string' || typeof data === 'number') return String(data)
  if (data && typeof data === 'object' && 'job_id' in data) {
    return String((data as { job_id: string | number }).job_id)
  }
  throw new Error('Invalid job creation response')
}

export async function downloadImage(url: string, filename: string) {
  const res = await fetch(url)
  const blob = await res.blob()
  const objectUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = objectUrl
  a.download = filename
  a.click()
  URL.revokeObjectURL(objectUrl)
}
