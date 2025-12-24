'use client'

import { useState } from 'react'
import axios from 'axios'
// @ts-expect-error: file-saver does not have type definitions available
import { saveAs } from 'file-saver'
import jsPDF from 'jspdf'
import JSZip from 'jszip'

interface FileResult {
  filename: string
  status: string
  original_text?: string
  translated_text?: string
  detected_language?: string
  error?: string
  isTranslated?: boolean
}

export default function BulkUpload() {
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<FileResult[]>([])
  const [progress, setProgress] = useState('')
  const [outputFormat, setOutputFormat] = useState<'same' | 'pdf' | 'txt' | 'docx'>('same')

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
      setResults([])
    }
  }

  const handleExtractText = async () => {
    if (files.length === 0) return

    setLoading(true)
    setProgress('Extracting text from files...')

    const formData = new FormData()
    files.forEach(file => formData.append('files', file))

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await axios.post(`${API_BASE}/bulk-extract`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 300000
      })

      setResults(response.data.results.map((r: FileResult) => ({ ...r, isTranslated: false })))
      setProgress('Text extraction complete!')
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any
      setProgress('Error: ' + (error.response?.data?.detail || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handleTranslateAll = async () => {
    if (results.length === 0) return

    setLoading(true)
    setProgress('Translating extracted text...')

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const translatedResults = await Promise.all(
        results.map(async (result) => {
          if (result.status === 'success' && result.original_text) {
            try {
              const response = await axios.post(`${API_BASE}/translate`, {
                text: result.original_text,
                src_lang: result.detected_language || 'ne_NP',
                tgt_lang: 'en_XX'
              })
              return {
                ...result,
                translated_text: response.data.translated_text,
                isTranslated: true
              }
            } catch {
              return result
            }
          }
          return result
        })
      )

      setResults(translatedResults)
      setProgress('Translation complete!')
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any
      setProgress('Error: ' + (error.response?.data?.detail || error.message))
    } finally {
      setLoading(false)
    }
  }

  const saveFile = (result: FileResult, type: 'original' | 'translated') => {
    const text = type === 'original' ? result.original_text : result.translated_text
    if (!text) return

    const baseName = result.filename.replace(/\.[^/.]+$/, '')
    const suffix = type === 'original' ? '_O' : '_T'
    const originalExt = result.filename.split('.').pop()?.toLowerCase()
    const format = outputFormat === 'same' ? originalExt : outputFormat

    if (format === 'pdf') {
      const doc = new jsPDF()
      const lines = doc.splitTextToSize(text, 180)
      doc.text(lines, 15, 15)
      doc.save(`${baseName}${suffix}.pdf`)
    } else if (format === 'txt') {
      const blob = new Blob([text], { type: 'text/plain' })
      saveAs(blob, `${baseName}${suffix}.txt`)
    } else if (format === 'docx' || format === 'doc') {
      const blob = new Blob([text], { type: 'application/msword' })
      saveAs(blob, `${baseName}${suffix}.doc`)
    } else {
      const blob = new Blob([text], { type: 'text/plain' })
      saveAs(blob, `${baseName}${suffix}.txt`)
    }
  }

  const saveAllFiles = async () => {
    const zip = new JSZip()
    const successResults = results.filter(r => r.status === 'success')

    for (const result of successResults) {
      const baseName = result.filename.replace(/\.[^/.]+$/, '')
      const format = outputFormat === 'same' ? result.filename.split('.').pop()?.toLowerCase() : outputFormat

      // Add original extracted text (_O)
      if (result.original_text) {
        if (format === 'pdf') {
          const doc = new jsPDF()
          const lines = doc.splitTextToSize(result.original_text, 180)
          doc.text(lines, 15, 15)
          zip.file(`${baseName}_O.pdf`, doc.output('blob'))
        } else if (format === 'txt') {
          zip.file(`${baseName}_O.txt`, result.original_text)
        } else if (format === 'docx' || format === 'doc') {
          zip.file(`${baseName}_O.doc`, new Blob([result.original_text], { type: 'application/msword' }))
        } else {
          zip.file(`${baseName}_O.txt`, result.original_text)
        }
      }

      // Add translated text (_T) if available
      if (result.translated_text && result.isTranslated) {
        if (format === 'pdf') {
          const doc = new jsPDF()
          const lines = doc.splitTextToSize(result.translated_text, 180)
          doc.text(lines, 15, 15)
          zip.file(`${baseName}_T.pdf`, doc.output('blob'))
        } else if (format === 'txt') {
          zip.file(`${baseName}_T.txt`, result.translated_text)
        } else if (format === 'docx' || format === 'doc') {
          zip.file(`${baseName}_T.doc`, new Blob([result.translated_text], { type: 'application/msword' }))
        } else {
          zip.file(`${baseName}_T.txt`, result.translated_text)
        }
      }
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' })
    saveAs(zipBlob, 'all_files.zip')
  }

  return (
    <div className="translator-shrine" style={{ marginTop: '30px' }}>
      <div className="shrine-header">
        <h2 className="shrine-title">BULK FILE TRANSLATION</h2>
        <div className="decorative-border"></div>
      </div>

      <div style={{ padding: '20px' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            padding: '30px',
            border: '3px dashed var(--accent)',
            borderRadius: '15px',
            textAlign: 'center',
            cursor: 'pointer',
            background: 'var(--bg-accent)',
            transition: 'all 0.3s ease'
          }}>
            <input
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.pdf,.txt,.doc,.docx"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <span style={{ fontSize: '48px' }}>📁</span>
            <p style={{ margin: '10px 0', color: 'var(--text-primary)', fontWeight: '700', fontSize: '16px' }}>
              Click to select multiple files
            </p>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Supported: JPG, PNG, PDF, TXT, DOC, DOCX
            </p>
          </label>
        </div>

        <div style={{ marginBottom: '20px', padding: '15px', background: '#f9f6f0', borderRadius: '8px' }}>
          <label style={{ display: 'block', marginBottom: '10px', color: '#8b4513', fontWeight: '600' }}>
            Output Format:
          </label>
          <select
            value={outputFormat}
            onChange={(e) => setOutputFormat(e.target.value as 'same' | 'pdf' | 'txt' | 'docx')}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              border: '2px solid #daa520',
              fontSize: '16px'
            }}
          >
            <option value="same">Same as original</option>
            <option value="pdf">PDF</option>
            <option value="txt">TXT</option>
            <option value="docx">DOCX</option>
          </select>
        </div>

        {files.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#8b4513', marginBottom: '10px' }}>
              Selected Files ({files.length})
            </h3>
            <div style={{ maxHeight: '150px', overflow: 'auto', background: '#f9f6f0', padding: '10px', borderRadius: '8px' }}>
              {files.map((file, idx) => (
                <div key={idx} style={{ padding: '5px', borderBottom: '1px solid #ddd' }}>
                  📄 {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center', marginBottom: '20px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <button
            onClick={handleExtractText}
            disabled={loading || files.length === 0}
            className="transform-btn"
          >
            {loading && !results.length ? 'EXTRACTING...' : 'EXTRACT TEXT'}
          </button>
          {results.length > 0 && (
            <button
              onClick={handleTranslateAll}
              disabled={loading}
              className="transform-btn"
              style={{ background: 'linear-gradient(135deg, #2e7d32, #1b5e20)' }}
            >
              {loading && results.length > 0 ? 'TRANSLATING...' : 'TRANSLATE ALL'}
            </button>
          )}
        </div>

        {progress && (
          <div style={{
            padding: '18px',
            background: loading ? 'linear-gradient(135deg, #FFF8DC 0%, #F5DEB3 100%)' : 'linear-gradient(135deg, #FFF8DC 0%, #F5DEB3 100%)',
            border: `3px solid ${loading ? 'var(--accent)' : 'var(--primary)'}`,
            borderRadius: '12px',
            marginBottom: '20px',
            textAlign: 'center',
            fontWeight: '700',
            color: 'var(--text-primary)',
            boxShadow: '0 4px 15px rgba(139, 69, 19, 0.2)',
            fontSize: '15px'
          }}>
            {loading ? '⏳ ' : '✅ '}{progress}
          </div>
        )}

        {results.length > 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ color: '#8b4513' }}>Translation Results ({results.filter(r => r.status === 'success').length} successful)</h3>
              <button
                onClick={saveAllFiles}
                className="transform-btn"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                📦 Download All as ZIP
              </button>
            </div>

            {results.map((result, idx) => (
              <div key={idx} style={{
                padding: '20px',
                marginBottom: '15px',
                background: result.status === 'success' ? 'linear-gradient(135deg, #FFF8DC 0%, #F5DEB3 100%)' : '#ffe8e8',
                border: `3px solid ${result.status === 'success' ? 'var(--accent)' : '#dc3545'}`,
                borderRadius: '12px',
                boxShadow: result.status === 'success' ? '0 4px 15px rgba(218, 165, 32, 0.2)' : '0 4px 15px rgba(220, 53, 69, 0.2)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{result.filename}</strong>
                    {result.detected_language && (
                      <span style={{ marginLeft: '10px', fontSize: '12px', color: '#666' }}>
                        {result.detected_language === 'ne_NP' ? '🇳🇵 Nepali' : '🇱🇰 Sinhala'}
                      </span>
                    )}
                  </div>
                  {result.status === 'success' && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => saveFile(result, 'original')}
                        style={{
                          padding: '10px 20px',
                          borderRadius: '8px',
                          border: '2px solid #daa520',
                          background: 'var(--bg-secondary)',
                          color: 'var(--text-primary)',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        💾 Original (_O)
                      </button>
                      {result.isTranslated && result.translated_text && (
                        <button
                          onClick={() => saveFile(result, 'translated')}
                          style={{
                            padding: '10px 20px',
                            borderRadius: '8px',
                            border: '2px solid #2e7d32',
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          💾 Translation (_T)
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {result.status === 'error' && (
                  <p style={{ color: '#dc3545', marginTop: '10px' }}>❌ {result.error}</p>
                )}

                {result.status === 'success' && result.original_text && (
                  <div style={{ marginTop: '15px' }}>
                    <div style={{ marginBottom: '10px' }}>
                      <strong style={{ color: '#8b4513' }}>📄 Extracted Text:</strong>
                      <div style={{
                        marginTop: '8px',
                        padding: '12px',
                        background: 'white',
                        borderRadius: '6px',
                        maxHeight: '150px',
                        overflow: 'auto',
                        border: '2px solid #daa520'
                      }}>
                        {result.original_text}
                      </div>
                    </div>
                    {result.isTranslated && result.translated_text && (
                      <div>
                        <strong style={{ color: '#2e7d32' }}>✅ Translation:</strong>
                        <div style={{
                          marginTop: '8px',
                          padding: '12px',
                          background: '#f1f8f4',
                          borderRadius: '6px',
                          maxHeight: '150px',
                          overflow: 'auto',
                          border: '2px solid #2e7d32'
                        }}>
                          {result.translated_text}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
