import { useCallback } from 'react'
import { Upload, Music, X } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'

interface AudioUploadProps {
  audioFile: File | null
  onFileSelect: (file: File | null) => void
}

export function AudioUpload({ audioFile, onFileSelect }: AudioUploadProps) {
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    const audioFile = files.find(file => file.type.startsWith('audio/'))
    if (audioFile) {
      onFileSelect(audioFile)
    }
  }, [onFileSelect])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileSelect(file)
    }
  }, [onFileSelect])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-2">Audio Upload</h2>
        <p className="text-sm text-muted-foreground">
          Upload your audio file to get started
        </p>
      </div>

      {!audioFile ? (
        <Card 
          className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => document.getElementById('audio-upload')?.click()}
        >
          <CardContent className="flex flex-col items-center justify-center py-12 px-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-medium mb-2">Drop your audio file here</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Supports MP3, WAV, M4A, FLAC, OGG
            </p>
            <Button variant="outline" size="sm">
              Browse Files
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Music className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{audioFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(audioFile.size)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onFileSelect(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <input
        id="audio-upload"
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={handleFileInput}
      />
    </div>
  )
}