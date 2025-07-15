import { useState } from 'react'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { Header } from './components/Header'
import { AudioUpload } from './components/AudioUpload'
import { VideoOptions } from './components/VideoOptions'
import { PreviewCanvas } from './components/PreviewCanvas'
import { SettingsSidebar } from './components/SettingsSidebar'

function App() {
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [videoMode, setVideoMode] = useState<'ai-visual' | 'visualization' | 'lyrics'>('ai-visual')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [srtFile, setSrtFile] = useState<File | null>(null)
  const [visualizationType, setVisualizationType] = useState('milkdrop')
  const [aiImages, setAiImages] = useState<string[]>([])

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="min-h-screen bg-background text-foreground">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex h-[calc(100vh-4rem)]">
          {/* Main Content */}
          <div className="flex-1 flex flex-col lg:flex-row">
            {/* Left Panel - Controls */}
            <div className="w-full lg:w-96 border-r border-border bg-card/50 p-6 overflow-y-auto">
              <div className="space-y-6">
                <AudioUpload 
                  audioFile={audioFile}
                  onFileSelect={setAudioFile}
                />
                
                <VideoOptions 
                  mode={videoMode}
                  onModeChange={setVideoMode}
                  audioFile={audioFile}
                  isGenerating={isGenerating}
                  onGenerate={() => setIsGenerating(true)}
                  onAIGenerate={(prompt, style) => {
                    // Handle AI generation
                    console.log('AI Generate:', prompt, style)
                  }}
                  onExport={() => {
                    // Handle export
                    console.log('Export video')
                  }}
                  onSrtFileChange={setSrtFile}
                  onVisualizationTypeChange={setVisualizationType}
                />
              </div>
            </div>

            {/* Right Panel - Preview */}
            <div className="flex-1 p-6">
              <PreviewCanvas 
                audioFile={audioFile}
                videoMode={videoMode}
                isGenerating={isGenerating}
                onGenerationComplete={() => setIsGenerating(false)}
                srtFile={srtFile}
                visualizationType={visualizationType}
                aiImages={aiImages}
              />
            </div>
          </div>

          {/* Settings Sidebar */}
          <SettingsSidebar 
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            videoMode={videoMode}
            visualizationType={visualizationType}
            onVisualizationTypeChange={setVisualizationType}
          />
        </main>

        <Toaster position="bottom-right" />
      </div>
    </ThemeProvider>
  )
}

export default App