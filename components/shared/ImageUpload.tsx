'use client'

import { useState, useRef } from 'react'
import { api } from '@/lib/api'
import { ImagePlus, X, Loader2 } from 'lucide-react'

interface ImageUploadProps {
  value: string | null
  onChange: (url: string | null) => void
  folder: 'events' | 'nominees'
  label?: string
  hint?: string
  aspectRatio?: 'square' | 'video'
}

export function ImageUpload({
  value,
  onChange,
  folder,
  label = 'Upload image',
  hint = 'PNG, JPG, JPEG or WEBP. Max 5MB.',
  aspectRatio = 'square',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      const response = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      onChange(response.data.url)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(null)
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all overflow-hidden ${
          aspectRatio === 'square' ? 'aspect-square' : 'aspect-video'
        }`}
      >
        {value ? (
          <>
            <img src={value} alt="Uploaded" className="w-full h-full object-cover" />
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition"
            >
              <X className="w-3.5 h-3.5 text-white" />
            </button>
          </>
        ) : uploading ? (
          <div className="flex flex-col items-center gap-2 p-6">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 p-6 text-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-1">
              <ImagePlus className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground">{hint}</p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-destructive mt-1.5">{error}</p>
      )}
    </div>
  )
}