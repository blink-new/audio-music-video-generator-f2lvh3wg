export interface SRTEntry {
  id: number
  startTime: number
  endTime: number
  text: string
}

export function parseSRT(content: string): SRTEntry[] {
  const entries: SRTEntry[] = []
  const blocks = content.trim().split(/\n\s*\n/)

  for (const block of blocks) {
    const lines = block.trim().split('\n')
    if (lines.length < 3) continue

    const id = parseInt(lines[0])
    if (isNaN(id)) continue

    const timeMatch = lines[1].match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/)
    if (!timeMatch) continue

    const startTime = parseTime(timeMatch[1], timeMatch[2], timeMatch[3], timeMatch[4])
    const endTime = parseTime(timeMatch[5], timeMatch[6], timeMatch[7], timeMatch[8])
    
    const text = lines.slice(2).join('\n').replace(/<[^>]*>/g, '') // Remove HTML tags

    entries.push({
      id,
      startTime,
      endTime,
      text
    })
  }

  return entries.sort((a, b) => a.startTime - b.startTime)
}

function parseTime(hours: string, minutes: string, seconds: string, milliseconds: string): number {
  return (
    parseInt(hours) * 3600 +
    parseInt(minutes) * 60 +
    parseInt(seconds) +
    parseInt(milliseconds) / 1000
  )
}

export function getCurrentLyric(entries: SRTEntry[], currentTime: number): SRTEntry | null {
  return entries.find(entry => 
    currentTime >= entry.startTime && currentTime <= entry.endTime
  ) || null
}

export function getUpcomingLyric(entries: SRTEntry[], currentTime: number): SRTEntry | null {
  return entries.find(entry => entry.startTime > currentTime) || null
}