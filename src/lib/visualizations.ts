export interface VisualizationConfig {
  sensitivity: number
  colorScheme: string
  smoothing: number
  beatDetection: boolean
}

export class VisualizationEngine {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private analyser: AnalyserNode
  private dataArray: Uint8Array
  private bufferLength: number
  private animationId: number | null = null

  constructor(canvas: HTMLCanvasElement, analyser: AnalyserNode) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.analyser = analyser
    this.analyser.fftSize = 512
    this.bufferLength = this.analyser.frequencyBinCount
    this.dataArray = new Uint8Array(this.bufferLength)
  }

  start(type: string, config: VisualizationConfig) {
    this.stop()
    
    const animate = () => {
      this.animationId = requestAnimationFrame(animate)
      this.analyser.getByteFrequencyData(this.dataArray)
      
      switch (type) {
        case 'milkdrop':
          this.renderMilkdrop(config)
          break
        case 'fractals':
          this.renderFractals(config)
          break
        case 'fire':
          this.renderFire(config)
          break
        case 'electricity':
          this.renderElectricity(config)
          break
        case 'particles':
          this.renderParticles(config)
          break
        case 'waveform':
          this.renderWaveform(config)
          break
        default:
          this.renderSpectrum(config)
      }
    }
    
    animate()
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
  }

  private renderMilkdrop(config: VisualizationConfig) {
    const { width, height } = this.canvas
    
    // Create flowing background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
    this.ctx.fillRect(0, 0, width, height)
    
    const time = Date.now() * 0.001
    const centerX = width / 2
    const centerY = height / 2
    
    // Create flowing patterns based on audio
    for (let i = 0; i < this.bufferLength; i++) {
      const amplitude = this.dataArray[i] / 255
      const angle = (i / this.bufferLength) * Math.PI * 2
      const radius = 100 + amplitude * 150
      
      const x = centerX + Math.cos(angle + time) * radius
      const y = centerY + Math.sin(angle + time) * radius
      
      const hue = (i / this.bufferLength * 360 + time * 50) % 360
      this.ctx.fillStyle = `hsla(${hue}, 70%, 60%, ${amplitude})`
      this.ctx.beginPath()
      this.ctx.arc(x, y, amplitude * 10, 0, Math.PI * 2)
      this.ctx.fill()
    }
  }

  private renderFractals(config: VisualizationConfig) {
    const { width, height } = this.canvas
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
    this.ctx.fillRect(0, 0, width, height)
    
    const time = Date.now() * 0.001
    const centerX = width / 2
    const centerY = height / 2
    
    // Calculate average amplitude
    const avgAmplitude = this.dataArray.reduce((sum, val) => sum + val, 0) / this.bufferLength / 255
    
    // Draw fractal pattern
    this.ctx.strokeStyle = `hsla(${time * 50 % 360}, 70%, 60%, 0.8)`
    this.ctx.lineWidth = 2
    
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + time
      const length = 50 + avgAmplitude * 200
      
      this.drawFractalBranch(
        centerX,
        centerY,
        angle,
        length,
        4,
        avgAmplitude
      )
    }
  }

  private drawFractalBranch(x: number, y: number, angle: number, length: number, depth: number, amplitude: number) {
    if (depth === 0) return
    
    const endX = x + Math.cos(angle) * length
    const endY = y + Math.sin(angle) * length
    
    this.ctx.beginPath()
    this.ctx.moveTo(x, y)
    this.ctx.lineTo(endX, endY)
    this.ctx.stroke()
    
    const newLength = length * 0.7
    this.drawFractalBranch(endX, endY, angle - 0.5 - amplitude, newLength, depth - 1, amplitude)
    this.drawFractalBranch(endX, endY, angle + 0.5 + amplitude, newLength, depth - 1, amplitude)
  }

  private renderFire(config: VisualizationConfig) {
    const { width, height } = this.canvas
    
    // Create fire effect
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
    this.ctx.fillRect(0, 0, width, height)
    
    const time = Date.now() * 0.001
    
    for (let i = 0; i < this.bufferLength; i++) {
      const amplitude = this.dataArray[i] / 255
      const x = (i / this.bufferLength) * width
      const flameHeight = amplitude * height * 0.8
      
      // Create flame gradient
      const gradient = this.ctx.createLinearGradient(x, height, x, height - flameHeight)
      gradient.addColorStop(0, '#ff4500')
      gradient.addColorStop(0.5, '#ff8c00')
      gradient.addColorStop(1, '#ffff00')
      
      this.ctx.fillStyle = gradient
      
      // Draw flame with noise
      this.ctx.beginPath()
      this.ctx.moveTo(x, height)
      
      for (let y = 0; y < flameHeight; y += 5) {
        const noise = Math.sin(time * 5 + y * 0.1 + i * 0.1) * 10 * (y / flameHeight)
        this.ctx.lineTo(x + noise, height - y)
      }
      
      this.ctx.lineTo(x + 10, height)
      this.ctx.fill()
    }
  }

  private renderElectricity(config: VisualizationConfig) {
    const { width, height } = this.canvas
    
    this.ctx.fillStyle = 'rgba(0, 0, 20, 0.1)'
    this.ctx.fillRect(0, 0, width, height)
    
    const time = Date.now() * 0.001
    
    // Find peaks for lightning bolts
    const peaks = []
    for (let i = 1; i < this.bufferLength - 1; i++) {
      if (this.dataArray[i] > this.dataArray[i - 1] && 
          this.dataArray[i] > this.dataArray[i + 1] && 
          this.dataArray[i] > 100) {
        peaks.push({ index: i, amplitude: this.dataArray[i] / 255 })
      }
    }
    
    // Draw lightning bolts
    this.ctx.strokeStyle = '#00ffff'
    this.ctx.lineWidth = 2
    this.ctx.shadowColor = '#00ffff'
    this.ctx.shadowBlur = 10
    
    peaks.forEach(peak => {
      const startX = (peak.index / this.bufferLength) * width
      const startY = height / 2
      
      this.drawLightning(startX, startY, startX + (Math.random() - 0.5) * 200, 
                        startY + (Math.random() - 0.5) * 200, peak.amplitude * 5)
    })
    
    this.ctx.shadowBlur = 0
  }

  private drawLightning(x1: number, y1: number, x2: number, y2: number, segments: number) {
    if (segments <= 0) return
    
    const midX = (x1 + x2) / 2 + (Math.random() - 0.5) * 50
    const midY = (y1 + y2) / 2 + (Math.random() - 0.5) * 50
    
    this.ctx.beginPath()
    this.ctx.moveTo(x1, y1)
    this.ctx.lineTo(midX, midY)
    this.ctx.lineTo(x2, y2)
    this.ctx.stroke()
    
    if (segments > 1) {
      this.drawLightning(x1, y1, midX, midY, segments - 1)
      this.drawLightning(midX, midY, x2, y2, segments - 1)
    }
  }

  private renderParticles(config: VisualizationConfig) {
    const { width, height } = this.canvas
    
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
    this.ctx.fillRect(0, 0, width, height)
    
    const time = Date.now() * 0.001
    
    for (let i = 0; i < this.bufferLength; i++) {
      const amplitude = this.dataArray[i] / 255
      if (amplitude < 0.1) continue
      
      const particleCount = Math.floor(amplitude * 10)
      
      for (let p = 0; p < particleCount; p++) {
        const angle = Math.random() * Math.PI * 2
        const distance = Math.random() * amplitude * 200
        const x = width / 2 + Math.cos(angle) * distance
        const y = height / 2 + Math.sin(angle) * distance
        
        const hue = (i / this.bufferLength * 360 + time * 100) % 360
        this.ctx.fillStyle = `hsla(${hue}, 70%, 60%, ${amplitude})`
        
        this.ctx.beginPath()
        this.ctx.arc(x, y, amplitude * 5, 0, Math.PI * 2)
        this.ctx.fill()
      }
    }
  }

  private renderWaveform(config: VisualizationConfig) {
    const { width, height } = this.canvas
    
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
    this.ctx.fillRect(0, 0, width, height)
    
    // Get time domain data for waveform
    const timeData = new Uint8Array(this.analyser.fftSize)
    this.analyser.getByteTimeDomainData(timeData)
    
    this.ctx.strokeStyle = '#8B5CF6'
    this.ctx.lineWidth = 3
    this.ctx.beginPath()
    
    const sliceWidth = width / timeData.length
    let x = 0
    
    for (let i = 0; i < timeData.length; i++) {
      const v = timeData[i] / 128.0
      const y = v * height / 2
      
      if (i === 0) {
        this.ctx.moveTo(x, y)
      } else {
        this.ctx.lineTo(x, y)
      }
      
      x += sliceWidth
    }
    
    this.ctx.stroke()
  }

  private renderSpectrum(config: VisualizationConfig) {
    const { width, height } = this.canvas
    
    this.ctx.fillStyle = 'rgba(15, 15, 35, 0.1)'
    this.ctx.fillRect(0, 0, width, height)
    
    const barWidth = width / this.bufferLength
    
    for (let i = 0; i < this.bufferLength; i++) {
      const barHeight = (this.dataArray[i] / 255) * height * 0.8
      const x = i * barWidth
      
      const gradient = this.ctx.createLinearGradient(0, height, 0, height - barHeight)
      gradient.addColorStop(0, '#8B5CF6')
      gradient.addColorStop(1, '#F59E0B')
      
      this.ctx.fillStyle = gradient
      this.ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight)
    }
  }
}