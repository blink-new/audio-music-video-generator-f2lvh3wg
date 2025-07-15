export interface ExportSettings {
  format: 'mp4' | 'webm' | 'mov' | 'avi'
  resolution: '720p' | '1080p' | '4k'
  frameRate: 24 | 30 | 60
  bitrate: number
  includeAudio: boolean
  loop: boolean
}

export interface ExportProgress {
  progress: number
  stage: 'preparing' | 'rendering' | 'encoding' | 'finalizing' | 'complete'
  message: string
}

export class VideoExporter {
  private canvas: HTMLCanvasElement
  private mediaRecorder: MediaRecorder | null = null
  private recordedChunks: Blob[] = []

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
  }

  async exportVideo(
    settings: ExportSettings,
    onProgress: (progress: ExportProgress) => void
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        onProgress({ progress: 0, stage: 'preparing', message: 'Preparing export...' })

        // Get canvas stream
        const stream = this.canvas.captureStream(settings.frameRate)
        
        // Configure media recorder
        const mimeType = this.getMimeType(settings.format)
        const options = {
          mimeType,
          videoBitsPerSecond: settings.bitrate * 1000000 // Convert Mbps to bps
        }

        this.mediaRecorder = new MediaRecorder(stream, options)
        this.recordedChunks = []

        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.recordedChunks.push(event.data)
          }
        }

        this.mediaRecorder.onstop = () => {
          onProgress({ progress: 90, stage: 'finalizing', message: 'Finalizing video...' })
          
          const blob = new Blob(this.recordedChunks, { type: mimeType })
          
          onProgress({ progress: 100, stage: 'complete', message: 'Export complete!' })
          resolve(blob)
        }

        this.mediaRecorder.onerror = (event) => {
          reject(new Error('Recording failed'))
        }

        // Start recording
        onProgress({ progress: 10, stage: 'rendering', message: 'Recording video...' })
        this.mediaRecorder.start()

        // Simulate progress updates
        let progress = 10
        const progressInterval = setInterval(() => {
          progress += 10
          if (progress < 80) {
            onProgress({ 
              progress, 
              stage: 'rendering', 
              message: `Recording video... ${progress}%` 
            })
          } else {
            clearInterval(progressInterval)
          }
        }, 500)

        // Stop recording after a duration (in real implementation, this would be based on audio length)
        setTimeout(() => {
          if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            onProgress({ progress: 80, stage: 'encoding', message: 'Encoding video...' })
            this.mediaRecorder.stop()
          }
        }, 5000) // 5 seconds for demo

      } catch (error) {
        reject(error)
      }
    })
  }

  private getMimeType(format: string): string {
    switch (format) {
      case 'webm':
        return 'video/webm;codecs=vp9'
      case 'mp4':
        return 'video/mp4;codecs=h264'
      default:
        return 'video/webm;codecs=vp9'
    }
  }

  downloadVideo(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  stop() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop()
    }
  }
}