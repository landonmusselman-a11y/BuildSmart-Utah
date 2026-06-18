'use client'

import { useRef, useState } from 'react'
import Papa from 'papaparse'
import { Upload, CheckCircle, AlertCircle } from 'lucide-react'

interface Props {
  onParsed: (rows: Record<string, string>[]) => void
  label?: string
  accept?: string
}

export default function CSVUploader({ onParsed, label = 'Upload CSV', accept = '.csv' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [dragging, setDragging] = useState(false)

  function parse(file: File) {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        if (results.data.length === 0) {
          setStatus('error')
          setMessage('No rows found in CSV')
          return
        }
        setStatus('success')
        setMessage(`${results.data.length} rows loaded`)
        onParsed(results.data)
      },
      error(err) {
        setStatus('error')
        setMessage(err.message)
      },
    })
  }

  function handleFile(file: File | undefined) {
    if (!file) return
    setStatus('idle')
    setMessage('')
    parse(file)
  }

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
        dragging ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 hover:border-white/20 bg-white/2'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={e => handleFile(e.target.files?.[0])}
      />
      {status === 'success' ? (
        <CheckCircle size={28} className="text-emerald-400 mx-auto mb-2" />
      ) : status === 'error' ? (
        <AlertCircle size={28} className="text-rose-400 mx-auto mb-2" />
      ) : (
        <Upload size={28} className="text-white/30 mx-auto mb-2" />
      )}
      <p className="text-white/70 text-sm font-medium">{label}</p>
      <p className="text-white/30 text-xs mt-1">
        {message || 'Drag & drop or click to browse'}
      </p>
    </div>
  )
}
