'use client'

import { useState, useRef } from 'react'
import axios from 'axios'
import { saveAs } from 'file-saver'
import jsPDF from 'jspdf'
import JSZip from 'jszip'

interface TranslationResult {
  filename: string
  status: string
  original_text?: string
  translated_text?: string
  detected_language?: string
  error?: string
}

export default function BulkUpload() {
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<TranslationResult[]>([])
  const [progress, setProgress] = useState('')
  const [outputFormat, setOutputFormat] = useState<'same' | 'pdf' | 'txt' | 'docx'>('same')
  const folderInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
      setResults([])
    }
  }

  const handleBulkTranslate = async () => {
    if (files.length === 0) return

    setLoading(true)
    setProgress('Uploading and translating files...')
    
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await axios.post(`${API_BASE}/bulk-translate`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 300000
      })

      setResults(response.data.results)
      setProgress('Translation complete!')
    } catch (err: any) {
      setProgress('Error: ' + (err.response?.data?.detail || err.message))
    } finally {
      setLoading(false)
    }
  }

  const saveTranslatedFile = (result: TranslationResult) => {
    if (!result.translated_text) return

    const baseName = result.filename.replace(/\.[^/.]+$/, '')
    const originalExt = result.filename.split('.').pop()?.toLowerCase()
    
    let format = outputFormat === 'same' ? originalExt : outputFormat

    if (format === 'pdf') {
      const doc = new jsPDF()
      const lines = doc.splitTextToSize(result.translated_text, 180)
      doc.text(lines, 15, 15)
      doc.save(`${baseName}_translated.pdf`)
    } else if (format === 'txt') {
      const blob = new Blob([result.translated_text], { type: 'text/plain' })
      saveAs(blob, `${baseName}_translated.txt`)
    } else if (format === 'docx' || format === 'doc') {
      const blob = new Blob([result.translated_text], { type: 'application/msword' })
      saveAs(blob, `${baseName}_translated.doc`)
    } else {
      const blob = new Blob([result.translated_text], { type: 'text/plain' })
      saveAs(blob, `${baseName}_translated.txt`)
    }
  }

  const saveAllFiles = async () => {
    const zip = new JSZip()
    const successResults = results.filter(r => r.status === 'success')

    for (const result of successResults) {
      const baseName = result.filename.replace(/\.[^/.]+$/, '')
      const format = outputFormat === 'same' ? result.filename.split('.').pop()?.toLowerCase() : outputFormat

      if (format === 'pdf') {
        const doc = new jsPDF()
        const lines = doc.splitTextToSize(result.translated_text, 180)
        doc.text(lines, 15, 15)
        const pdfBlob = doc.output('blob')
        zip.file(`${baseName}_translated.pdf`, pdfBlob)
      } else if (format === 'txt') {
        zip.file(`${baseName}_translated.txt`, result.translated_text)
      } else if (format === 'docx' || format === 'doc') {
        const blob = new Blob([result.translated_text], { type: 'application/msword' })
        zip.file(`${baseName}_translated.doc`, blob)
      } else {
        zip.file(`${baseName}_translated.txt`, result.translated_text)
      }
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' })
    saveAs(zipBlob, 'translated_files.zip')
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
            padding: '20px', 
            border: '3px dashed #daa520',
            borderRadius: '12px',
            textAlign: 'center',
            cursor: 'pointer',
            background: '#f9f6f0'
          }}>
            <input
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.pdf,.txt,.doc,.docx"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <span style={{ fontSize: '48px' }}>📁</span>
            <p style={{ margin: '10px 0', color: '#8b4513', fontWeight: '600' }}>
              Click to select multiple files
            </p>
            <p style={{ fontSize: '14px', color: '#666' }}>
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
            onChange={(e) => setOutputFormat(e.target.value as any)}
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

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <button
            onClick={handleBulkTranslate}
            disabled={loading || files.length === 0}
            className="transform-btn"
          >
            {loading ? 'TRANSLATING...' : 'TRANSLATE ALL FILES'}
          </button>
        </div>

        {progress && (
          <div style={{ 
            padding: '15px', 
            background: loading ? '#fff3cd' : '#d4edda',
            border: `2px solid ${loading ? '#ffc107' : '#28a745'}`,
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'center',
            fontWeight: '600'
          }}>
            {progress}
          </div>
        )}

        {results.length > 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ color: '#8b4513' }}>Translation Results ({results.filter(r => r.status === 'success').length} successful)</h3>
              <button
                onClick={saveAllFiles}
                className="voice-btn"
                style={{ background: 'var(--primary)', padding: '10px 20px' }}
              >
                💾 Download All
              </button>
            </div>

            {results.map((result, idx) => (
              <div key={idx} style={{
                padding: '15px',
                marginBottom: '15px',
                background: result.status === 'success' ? '#e8f5e8' : '#ffe8e8',
                border: `2px solid ${result.status === 'success' ? '#28a745' : '#dc3545'}`,
                borderRadius: '8px'
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
                    <button
                      onClick={() => {
                        const baseName = result.filename.replace(/\.[^/.]+$/, '')
                        const format = outputFormat === 'same' ? result.filename.split('.').pop()?.toLowerCase() : outputFormat

                        if (format === 'pdf') {
                          const doc = new jsPDF()
                          const lines = doc.splitTextToSize(result.translated_text, 180)
                          doc.text(lines, 15, 15)
                          doc.save(`${baseName}_translated.pdf`)
                        } else if (format === 'txt') {
                          const blob = new Blob([result.translated_text], { type: 'text/plain' })
                          saveAs(blob, `${baseName}_translated.txt`)
                        } else if (format === 'docx' || format === 'doc') {
                          const blob = new Blob([result.translated_text], { type: 'application/msword' })
                          saveAs(blob, `${baseName}_translated.doc`)
                        } else {
                          const blob = new Blob([result.translated_text], { type: 'text/plain' })
                          saveAs(blob, `${baseName}_translated.txt`)
                        }
                      }}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: '2px solid var(--border)',
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--accent)'
                        e.currentTarget.style.color = 'white'
                        e.currentTarget.style.transform = 'translateY(-2px)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--bg-secondary)'
                        e.currentTarget.style.color = 'var(--text-primary)'
                        e.currentTarget.style.transform = 'translateY(0)'
                      }}
                      title={`Download as ${outputFormat === 'same' ? 'original format' : outputFormat.toUpperCase()}`}
                    >
                      💾 Download
                    </button>
                  )}
                </div>
                
                {result.status === 'error' && (
                  <p style={{ color: '#dc3545', marginTop: '10px' }}>❌ {result.error}</p>
                )}
                
                {result.status === 'success' && result.translated_text && (
                  <div style={{ marginTop: '10px' }}>
                    <details>
                      <summary style={{ cursor: 'pointer', fontWeight: '600', color: '#8b4513' }}>
                        View Translation
                      </summary>
                      <div style={{ 
                        marginTop: '10px', 
                        padding: '10px', 
                        background: 'white', 
                        borderRadius: '6px',
                        maxHeight: '200px',
                        overflow: 'auto'
                      }}>
                        {result.translated_text}
                      </div>
                    </details>
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
