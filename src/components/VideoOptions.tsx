import { useState } from 'react'
import { Sparkles, Waves, Type, Upload, Wand2, Download } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { blink } from '../blink/client'
import { toast } from 'sonner'

interface VideoOptionsProps {
  mode: 'ai-visual' | 'visualization' | 'lyrics'
  onModeChange: (mode: 'ai-visual' | 'visualization' | 'lyrics') => void
  audioFile: File | null
  isGenerating: boolean
  onGenerate: () => void
  onAIGenerate?: (prompt: string, style: string) => void
  onExport?: () => void
  onSrtFileChange?: (file: File | null) => void
  onVisualizationTypeChange?: (type: string) => void
}

export function VideoOptions({ 
  mode, 
  onModeChange, 
  audioFile, 
  isGenerating, 
  onGenerate,
  onAIGenerate,
  onExport,
  onSrtFileChange,
  onVisualizationTypeChange
}: VideoOptionsProps) {
  const [srtFile, setSrtFile] = useState<File | null>(null)
  const [selectedVisualization, setSelectedVisualization] = useState('milkdrop')
  const [selectedAIStyle, setSelectedAIStyle] = useState('cinematic')
  const [customPrompt, setCustomPrompt] = useState('')
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)

  const visualizationTypes = [
    { id: 'milkdrop', name: 'Milkdrop', description: 'Classic audio-reactive visuals' },
    { id: 'fractals', name: 'Fractals', description: 'Mathematical patterns' },
    { id: 'fire', name: 'Fire', description: 'Dynamic flame effects' },
    { id: 'electricity', name: 'Electricity', description: 'Electric energy patterns' },
    { id: 'particles', name: 'Particles', description: 'Particle system effects' },
    { id: 'waveform', name: 'Waveform', description: 'Audio waveform display' }
  ]

  const aiStyles = [
    { id: 'cinematic', name: 'Cinematic', description: 'Movie-like visuals' },
    { id: 'abstract', name: 'Abstract', description: 'Artistic interpretations' },
    { id: 'nature', name: 'Nature', description: 'Natural landscapes' },
    { id: 'urban', name: 'Urban', description: 'City and street scenes' },
    { id: 'cartoon', name: 'Cartoon', description: 'Animated characters' },
    { id: 'sci-fi', name: 'Sci-Fi', description: 'Futuristic themes' }
  ]

  const handleSrtUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.name.endsWith('.srt')) {
      setSrtFile(file)
      onSrtFileChange?.(file)
    }
  }

  const handleVisualizationChange = (type: string) => {
    setSelectedVisualization(type)
    onVisualizationTypeChange?.(type)
  }

  const handleAIGenerate = async () => {
    if (!audioFile) return
    
    setIsGeneratingAI(true)
    try {
      // Create a prompt based on selected style and custom input
      const stylePrompts = {
        cinematic: 'cinematic movie-like visuals with dramatic lighting and composition',
        abstract: 'abstract artistic patterns and flowing shapes',
        nature: 'beautiful natural landscapes and organic forms',
        urban: 'modern city scenes and urban environments',
        cartoon: 'animated cartoon characters and playful scenes',
        'sci-fi': 'futuristic sci-fi environments with advanced technology'
      }
      
      const basePrompt = stylePrompts[selectedAIStyle as keyof typeof stylePrompts]
      const fullPrompt = customPrompt 
        ? `${basePrompt}, ${customPrompt}` 
        : `${basePrompt} that matches the mood and energy of this music`

      // Generate AI images for the video
      const { data } = await blink.ai.generateImage({
        prompt: fullPrompt,
        size: '1792x1024',
        quality: 'high',
        n: 4
      })

      toast.success(`Generated ${data.length} AI visuals for your video!`)
      
      if (onAIGenerate) {
        onAIGenerate(fullPrompt, selectedAIStyle)
      }
      
    } catch (error) {
      console.error('AI generation failed:', error)
      toast.error('Failed to generate AI visuals. Please try again.')
    } finally {
      setIsGeneratingAI(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Video Generation</h2>
        <p className="text-sm text-muted-foreground">
          Choose how you want to create your music video
        </p>
      </div>

      <Tabs value={mode} onValueChange={(value) => onModeChange(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ai-visual" className="text-xs">
            <Sparkles className="w-4 h-4 mr-1" />
            AI Visual
          </TabsTrigger>
          <TabsTrigger value="visualization" className="text-xs">
            <Waves className="w-4 h-4 mr-1" />
            Visualizer
          </TabsTrigger>
          <TabsTrigger value="lyrics" className="text-xs">
            <Type className="w-4 h-4 mr-1" />
            Lyrics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai-visual" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">AI-Generated Visuals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Visual Style</Label>
                <div className="grid grid-cols-2 gap-2">
                  {aiStyles.map((style) => (
                    <Button
                      key={style.id}
                      variant={selectedAIStyle === style.id ? "default" : "outline"}
                      size="sm"
                      className="h-auto p-3 flex flex-col items-start"
                      onClick={() => setSelectedAIStyle(style.id)}
                    >
                      <span className="font-medium text-xs">{style.name}</span>
                      <span className="text-xs text-muted-foreground mt-1">
                        {style.description}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Custom Prompt (Optional)</Label>
                <Textarea
                  placeholder="Describe additional visual elements you want to see..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="min-h-[80px] text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Add specific details to customize your AI-generated visuals
                </p>
              </div>

              <Button
                onClick={handleAIGenerate}
                disabled={!audioFile || isGeneratingAI}
                className="w-full"
                size="sm"
              >
                {isGeneratingAI ? (
                  <>
                    <Wand2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating AI Visuals...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate AI Visuals
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visualization" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Visualization Type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-2">
                {visualizationTypes.map((viz) => (
                  <Button
                    key={viz.id}
                    variant={selectedVisualization === viz.id ? "default" : "outline"}
                    size="sm"
                    className="h-auto p-3 flex items-center justify-start"
                    onClick={() => handleVisualizationChange(viz.id)}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-xs">{viz.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {viz.description}
                      </span>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lyrics" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Lyrics Video</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!srtFile ? (
                <div 
                  className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => document.getElementById('srt-upload')?.click()}
                >
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium mb-1">Upload SRT File</p>
                  <p className="text-xs text-muted-foreground">
                    Subtitle file with lyrics timing
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Type className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{srtFile.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSrtFile(null)}
                  >
                    Remove
                  </Button>
                </div>
              )}

              <input
                id="srt-upload"
                type="file"
                accept=".srt"
                className="hidden"
                onChange={handleSrtUpload}
              />

              {srtFile && (
                <div className="space-y-2">
                  <Badge variant="secondary" className="text-xs">
                    Font customization available in settings
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Separator />

      <div className="space-y-3">
        <Button 
          className="w-full" 
          size="lg"
          disabled={!audioFile || isGenerating || (mode === 'lyrics' && !srtFile)}
          onClick={onGenerate}
        >
          {isGenerating ? (
            <>
              <Wand2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              Generate Video
            </>
          )}
        </Button>

        {onExport && (
          <Button 
            variant="outline"
            className="w-full" 
            size="lg"
            disabled={!audioFile || isGenerating}
            onClick={onExport}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Video
          </Button>
        )}
      </div>
    </div>
  )
}