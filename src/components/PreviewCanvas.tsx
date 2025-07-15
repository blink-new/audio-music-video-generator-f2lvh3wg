import { useEffect, useRef, useState, useCallback } from 'react'
import { Play, Pause, Volume2, Maximize2, Download } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Progress } from './ui/progress'
import { Slider } from './ui/slider'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { VisualizationEngine } from '../lib/visualizations'
import { parseSRT, getCurrentLyric, type SRTEntry } from '../lib/srt-parser'
import { VideoExporter, type ExportSettings, type ExportProgress } from '../lib/video-export'
import { toast } from 'sonner'

interface PreviewCanvasProps {
  audioFile: File | null
  videoMode: 'ai-visual' | 'visualization' | 'lyrics'
  isGenerating: boolean
  onGenerationComplete: () => void
  srtFile?: File | null
  visualizationType?: string
  aiImages?: string[]
}

export function PreviewCanvas({ 
  audioFile, 
  videoMode, 
  isGenerating, 
  onGenerationComplete,
  srtFile,
  visualizationType = 'milkdrop',
  aiImages = []
}: PreviewCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const visualizationEngineRef = useRef<VisualizationEngine | null>(null)
  const videoExporterRef = useRef<VideoExporter | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState([80])
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [srtEntries, setSrtEntries] = useState<SRTEntry[]>([])
  const [currentLyric, setCurrentLyric] = useState<SRTEntry | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null)
  const [showExportDialog, setShowExportDialog] = useState(false)

  // Create audio URL when file changes
  useEffect(() => {
    if (audioFile) {
      const url = URL.createObjectURL(audioFile)
      setAudioUrl(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setAudioUrl(null)
    }
  }, [audioFile])

  // Parse SRT file when it changes
  useEffect(() => {
    if (srtFile) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        if (content) {
          const entries = parseSRT(content)
          setSrtEntries(entries)
        }
      }
      reader.readAsText(srtFile)
    } else {
      setSrtEntries([])
    }
  }, [srtFile])

  // Update current lyric based on time
  useEffect(() => {
    if (srtEntries.length > 0) {
      const lyric = getCurrentLyric(srtEntries, currentTime)
      setCurrentLyric(lyric)
    }
  }, [srtEntries, currentTime])

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [audioUrl])

  // Enhanced canvas visualization
  useEffect(() => {
    const canvas = canvasRef.current
    const audio = audioRef.current
    if (!canvas || !audio) return

    // Initialize video exporter
    if (!videoExporterRef.current) {
      videoExporterRef.current = new VideoExporter(canvas)
    }

    if (!isPlaying) {
      visualizationEngineRef.current?.stop()
      return
    }

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const analyser = audioContext.createAnalyser()
    const source = audioContext.createMediaElementSource(audio)
    
    source.connect(analyser)
    analyser.connect(audioContext.destination)

    // Initialize visualization engine
    if (!visualizationEngineRef.current) {
      visualizationEngineRef.current = new VisualizationEngine(canvas, analyser)
    }

    if (audioContext.state === 'suspended') {
      audioContext.resume()
    }

    // Start appropriate visualization based on mode
    if (videoMode === 'visualization') {
      visualizationEngineRef.current.start(visualizationType, {
        sensitivity: 75,
        colorScheme: 'rainbow',
        smoothing: 50,
        beatDetection: true
      })
    } else if (videoMode === 'ai-visual') {
      // Show AI images with audio-reactive effects
      renderAIVisualsInternal(canvas, analyser, aiImages)
    } else if (videoMode === 'lyrics') {
      // Show lyrics with visualization background
      renderLyricsVideoInternal(canvas, analyser, currentLyric)
    }

    return () => {
      visualizationEngineRef.current?.stop()
      audioContext.close()
    }
  }, [isPlaying, videoMode, visualizationType, aiImages, currentLyric, renderAIVisualsInternal, renderLyricsVideoInternal])

  // Simulate generation process
  useEffect(() => {
    if (isGenerating) {
      const timer = setTimeout(() => {
        onGenerationComplete()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isGenerating, onGenerationComplete])

  const togglePlayPause = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current
    if (!audio) return

    const newTime = (value[0] / 100) * duration
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current
    if (!audio) return

    setVolume(value)
    audio.volume = value[0] / 100
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const renderAIVisualsInternal = useCallback((canvas: HTMLCanvasElement, analyser: AnalyserNode, images: string[]) => {
    if (images.length === 0) {
      // Fallback to spectrum visualization
      visualizationEngineRef.current?.start('milkdrop', {
        sensitivity: 75,
        colorScheme: 'rainbow',
        smoothing: 50,
        beatDetection: true
      })
      return
    }

    const ctx = canvas.getContext('2d')!
    const dataArray = new Uint8Array(analyser.frequencyBinCount)
    
    const animate = () => {
      if (!isPlaying) return
      requestAnimationFrame(animate)
      
      analyser.getByteFrequencyData(dataArray)
      const avgAmplitude = dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length / 255
      
      // Cycle through AI images based on audio intensity
      const imageIndex = Math.floor((avgAmplitude * images.length)) % images.length
      
      // Add audio-reactive effects to AI images
      ctx.fillStyle = `rgba(0, 0, 0, ${0.1 - avgAmplitude * 0.05})`
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Add pulsing effect based on audio
      const scale = 1 + avgAmplitude * 0.1
      ctx.save()
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.scale(scale, scale)
      ctx.translate(-canvas.width / 2, -canvas.height / 2)
      
      // In a real implementation, you would load and draw the AI images here
      // For now, we'll show a placeholder with the image URL
      ctx.fillStyle = '#8B5CF6'
      ctx.font = '16px Inter'
      ctx.textAlign = 'center'
      ctx.fillText(`AI Image ${imageIndex + 1}`, canvas.width / 2, canvas.height / 2)
      ctx.fillText(images[imageIndex] ? 'Generated' : 'Loading...', canvas.width / 2, canvas.height / 2 + 30)
      
      ctx.restore()
    }
    
    animate()
  }, [isPlaying])

  const renderLyricsVideoInternal = useCallback((canvas: HTMLCanvasElement, analyser: AnalyserNode, lyric: SRTEntry | null) => {
    const ctx = canvas.getContext('2d')!
    const dataArray = new Uint8Array(analyser.frequencyBinCount)
    
    const animate = () => {
      if (!isPlaying) return
      requestAnimationFrame(animate)
      
      analyser.getByteFrequencyData(dataArray)
      
      // Background visualization
      ctx.fillStyle = 'rgba(0, 0, 20, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Simple spectrum background
      const barWidth = canvas.width / dataArray.length
      for (let i = 0; i < dataArray.length; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.3
        const hue = (i / dataArray.length) * 360
        ctx.fillStyle = `hsla(${hue}, 70%, 50%, 0.3)`
        ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth, barHeight)
      }
      
      // Render lyrics
      if (lyric) {
        ctx.fillStyle = '#FFFFFF'
        ctx.font = 'bold 48px Inter'
        ctx.textAlign = 'center'
        ctx.shadowColor = '#000000'
        ctx.shadowBlur = 4
        ctx.shadowOffsetX = 2
        ctx.shadowOffsetY = 2
        
        // Split text into lines if too long
        const words = lyric.text.split(' ')
        const lines = []
        let currentLine = ''
        
        for (const word of words) {
          const testLine = currentLine + (currentLine ? ' ' : '') + word
          const metrics = ctx.measureText(testLine)
          if (metrics.width > canvas.width * 0.8 && currentLine) {
            lines.push(currentLine)
            currentLine = word
          } else {
            currentLine = testLine
          }
        }
        if (currentLine) lines.push(currentLine)
        
        // Draw lines centered
        const lineHeight = 60
        const startY = canvas.height / 2 - (lines.length * lineHeight) / 2
        
        lines.forEach((line, index) => {
          ctx.fillText(line, canvas.width / 2, startY + index * lineHeight)
        })
        
        ctx.shadowBlur = 0
      }
    }
    
    animate()
  }, [isPlaying])

  const handleExport = async () => {
    if (!videoExporterRef.current || !audioFile) return
    
    setIsExporting(true)
    setShowExportDialog(true)
    
    try {
      const settings: ExportSettings = {
        format: 'mp4',
        resolution: '1080p',
        frameRate: 30,
        bitrate: 8,
        includeAudio: true,
        loop: false
      }
      
      const blob = await videoExporterRef.current.exportVideo(settings, setExportProgress)
      
      // Download the video
      const filename = `music-video-${Date.now()}.${settings.format}`
      videoExporterRef.current.downloadVideo(blob, filename)
      
      toast.success('Video exported successfully!')
      
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Failed to export video. Please try again.')
    } finally {
      setIsExporting(false)
      setTimeout(() => setShowExportDialog(false), 2000)
    }
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div>
        <h2 className="text-lg font-semibold mb-2">Preview</h2>
        <p className="text-sm text-muted-foreground">
          {isGenerating ? 'Generating your music video...' : 'Preview your music video'}
        </p>
      </div>

      <Card className="flex-1 flex flex-col">
        <CardContent className="p-0 flex-1 flex flex-col">
          {/* Canvas Area */}
          <div className="flex-1 relative bg-gradient-to-br from-background to-muted/20 rounded-t-lg overflow-hidden">
            {audioFile ? (
              <>
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={450}
                  className="w-full h-full object-contain"
                />
                {isGenerating && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-sm">Generating {videoMode} video...</p>
                      <Progress value={66} className="w-48 mt-2" />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="w-8 h-8" />
                  </div>
                  <p className="text-lg font-medium mb-2">No Audio File</p>
                  <p className="text-sm">Upload an audio file to start creating</p>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          {audioFile && (
            <div className="p-4 border-t border-border space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <Slider
                  value={[duration ? (currentTime / duration) * 100 : 0]}
                  onValueChange={handleSeek}
                  max={100}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Playback Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={togglePlayPause}
                    disabled={!audioUrl}
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>

                  <div className="flex items-center space-x-2">
                    <Volume2 className="w-4 h-4 text-muted-foreground" />
                    <Slider
                      value={volume}
                      onValueChange={handleVolumeChange}
                      max={100}
                      step={1}
                      className="w-20"
                    />
                  </div>
                </div>

                <Button variant="outline" size="sm">
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="metadata"
        />
      )}
    </div>
  )
}