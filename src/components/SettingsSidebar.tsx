import { X, Palette, Type, Sliders, Image } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Slider } from './ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Switch } from './ui/switch'
import { Label } from './ui/label'
import { Separator } from './ui/separator'
import { Badge } from './ui/badge'

interface SettingsSidebarProps {
  isOpen: boolean
  onClose: () => void
  videoMode: 'ai-visual' | 'visualization' | 'lyrics'
  visualizationType?: string
  onVisualizationTypeChange?: (type: string) => void
}

export function SettingsSidebar({ 
  isOpen, 
  onClose, 
  videoMode, 
  visualizationType = 'milkdrop',
  onVisualizationTypeChange 
}: SettingsSidebarProps) {
  if (!isOpen) return null

  const fontFamilies = [
    'Inter', 'Roboto', 'Open Sans', 'Montserrat', 'Poppins', 'Lato',
    'Oswald', 'Raleway', 'Nunito', 'Source Sans Pro', 'Playfair Display',
    'Merriweather', 'Dancing Script', 'Pacifico', 'Righteous'
  ]

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-card border-l border-border shadow-lg z-50 overflow-y-auto">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Settings</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Video Quality */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <Sliders className="w-4 h-4 mr-2" />
                Video Quality
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">Resolution</Label>
                <Select defaultValue="1080p">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="720p">720p HD</SelectItem>
                    <SelectItem value="1080p">1080p Full HD</SelectItem>
                    <SelectItem value="4k">4K Ultra HD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Frame Rate</Label>
                <Select defaultValue="30">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24">24 FPS</SelectItem>
                    <SelectItem value="30">30 FPS</SelectItem>
                    <SelectItem value="60">60 FPS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Bitrate</Label>
                <Slider defaultValue={[8]} max={20} min={1} step={1} />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 Mbps</span>
                  <span>20 Mbps</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mode-specific settings */}
          {videoMode === 'ai-visual' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <Image className="w-4 h-4 mr-2" />
                  AI Visual Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs">Style Intensity</Label>
                  <Slider defaultValue={[70]} max={100} min={0} step={5} />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Motion Sensitivity</Label>
                  <Slider defaultValue={[60]} max={100} min={0} step={5} />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-xs">Color Enhancement</Label>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-xs">Dynamic Transitions</Label>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          )}

          {videoMode === 'visualization' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <Palette className="w-4 h-4 mr-2" />
                  Visualization Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs">Visualization Type</Label>
                  <Select 
                    value={visualizationType} 
                    onValueChange={onVisualizationTypeChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="milkdrop">Milkdrop</SelectItem>
                      <SelectItem value="fractals">Fractals</SelectItem>
                      <SelectItem value="fire">Fire</SelectItem>
                      <SelectItem value="electricity">Electricity</SelectItem>
                      <SelectItem value="particles">Particles</SelectItem>
                      <SelectItem value="waveform">Waveform</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Sensitivity</Label>
                  <Slider defaultValue={[75]} max={100} min={0} step={5} />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Color Scheme</Label>
                  <Select defaultValue="rainbow">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rainbow">Rainbow</SelectItem>
                      <SelectItem value="monochrome">Monochrome</SelectItem>
                      <SelectItem value="warm">Warm Colors</SelectItem>
                      <SelectItem value="cool">Cool Colors</SelectItem>
                      <SelectItem value="neon">Neon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Smoothing</Label>
                  <Slider defaultValue={[50]} max={100} min={0} step={5} />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-xs">Beat Detection</Label>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          )}

          {videoMode === 'lyrics' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <Type className="w-4 h-4 mr-2" />
                  Typography Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs">Font Family</Label>
                  <Select defaultValue="Inter">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontFamilies.map((font) => (
                        <SelectItem key={font} value={font}>
                          {font}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Font Size</Label>
                  <Slider defaultValue={[48]} max={120} min={16} step={2} />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>16px</span>
                    <span>120px</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Font Weight</Label>
                  <Select defaultValue="600">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="300">Light</SelectItem>
                      <SelectItem value="400">Regular</SelectItem>
                      <SelectItem value="500">Medium</SelectItem>
                      <SelectItem value="600">Semi Bold</SelectItem>
                      <SelectItem value="700">Bold</SelectItem>
                      <SelectItem value="800">Extra Bold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Text Color</Label>
                  <div className="grid grid-cols-6 gap-2">
                    {['#FFFFFF', '#000000', '#8B5CF6', '#F59E0B', '#EF4444', '#10B981'].map((color) => (
                      <button
                        key={color}
                        className="w-8 h-8 rounded border-2 border-border hover:border-primary transition-colors"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Text Position</Label>
                  <Select defaultValue="center">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top">Top</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="bottom">Bottom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <Label className="text-xs">Text Shadow</Label>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-xs">Outline</Label>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-xs">Karaoke Effect</Label>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Export Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Export Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">Format</Label>
                <Select defaultValue="mp4">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mp4">MP4</SelectItem>
                    <SelectItem value="mov">MOV</SelectItem>
                    <SelectItem value="avi">AVI</SelectItem>
                    <SelectItem value="webm">WebM</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-xs">Include Audio</Label>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-xs">Loop Video</Label>
                <Switch />
              </div>

              <Badge variant="secondary" className="text-xs">
                Watermark-free exports available
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}