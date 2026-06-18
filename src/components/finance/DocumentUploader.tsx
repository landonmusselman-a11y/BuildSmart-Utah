'use client'

import { useRef, useState } from 'react'
import { Upload, CheckCircle, AlertCircle, Loader2, Sparkles } from 'lucide-react'

export type ParsedDocument = {
  docType: string
  fileName: string
  data: Record<string, unknown>
}

interface Props {
  onParsed: (result: ParsedDocument) => void
  label?: string
  hint?: string
  accept?: string
}

export default function DocumentUploader({ onParsed, label = 'Upload Document', hint, accept = '.pdf,.csv,.jpg,.jpeg,.png,.webp,.heic' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<'idle' | 'reading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [dragging, setDragging] = useState(false)

  async function process(file: File) {
    setStatus('reading')
    setMessage('Claude is reading your document...')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/finance/parse-document', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok || !json.ok) {
        setStatus('error')
        setMessage(json.error || 'Could not read document')
        return
      }
      setStatus('success')
      setMessage(`Extracted: ${json.data.docType || 'document'}`)
      onParsed({ docType: json.data.docType, fileName: json.fileName, data: json.data })
    } catch (err) {
      setStatus('error')
      setMessage('Upload failed — check your connection')
    }
  }

  function handleFile(file: File | undefined) {
    if (!file) return
    setStatus('idle')
    setMessage('')
    process(file)
  }

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
      onClick={() => status !== 'reading' && inputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
        status === 'reading' ? 'border-indigo-500/50 bg-indigo-500/5 cursor-wait' :
        dragging ? 'border-indigo-500 bg-indigo-500/10 cursor-copy' :
        'border-white/10 hover:border-white/20 bg-white/2 cursor-pointer'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={e => handleFile(e.target.files?.[0])}
      />
      {status === 'reading' ? (
        <Loader2 size={26} className="text-indigo-400 mx-auto mb-2 animate-spin" />
      ) : status === 'success' ? (
        <CheckCircle size={26} className="text-emerald-400 mx-auto mb-2" />
      ) : status === 'error' ? (
        <AlertCircle size={26} className="text-rose-400 mx-auto mb-2" />
      ) : (
        <div className="relative mx-auto w-fit mb-2">
          <Upload size={26} className="text-white/30" />
          <Sparkles size={12} className="text-indigo-400 absolute -top-1 -right-2" />
        </div>
      )}
      <p className="text-white/70 text-sm font-medium">{label}</p>
      <p className={`text-xs mt-1 ${status === 'error' ? 'text-rose-400' : status === 'success' ? 'text-emerald-400' : 'text-white/30'}`}>
        {message || hint || 'PDF, image, or CSV · Claude reads it automatically'}
      </p>
      {status === 'error' && (
        <button
          onClick={e => { e.stopPropagation(); setStatus('idle'); setMessage('') }}
          className="mt-2 text-white/40 text-xs hover:text-white underline"
        >
          Try again
        </button>
      )}
    </div>
  )
}
