'use client'

import { useState, useRef } from 'react'
import axios from 'axios'
import { useLanguage } from '../contexts/LanguageContext'
import WelcomeHeader from './WelcomeHeader'

interface TranslationResponse {
  translated_text: string
  source_lang: string
  target_lang: string
}

export default function TranslationInterface() {
  const { t } = useLanguage()
  const [inputText, setInputText] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [detectedLang, setDetectedLang] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ocrLoading, setOcrLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const recognitionRef = useRef<any>(null)

  const detectLanguage = (text: string): string => {
    const nepaliPattern = /[\u0900-\u097F]/
    const sinhalaPattern = /[\u0D80-\u0DFF]/
    
    if (nepaliPattern.test(text)) return 'ne_NP'
    if (sinhalaPattern.test(text)) return 'si_LK'
    return 'ne_NP'
  }

  const handleOCR = async (type: 'printed' | 'handwritten') => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      setOcrLoading(true)
      const formData = new FormData()
      formData.append('file', file)

      try {
        const endpoint = type === 'printed' ? '/ocr/printed' : '/ocr/handwritten'
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''
        const response = await axios.post(`${API_BASE}${endpoint}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        setInputText(response.data.extracted_text)
      } catch (err) {
        console.error('OCR failed:', err)
        setError('Text extraction failed')
      } finally {
        setOcrLoading(false)
      }
    }
    input.click()
  }

  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition not supported. Use Chrome or Edge.')
      return
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    recognitionRef.current = new SpeechRecognition()
    recognitionRef.current.continuous = true
    recognitionRef.current.interimResults = true
    recognitionRef.current.lang = 'ne-NP'

    recognitionRef.current.onresult = (event: any) => {
      let finalTranscript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' '
        }
      }
      if (finalTranscript) {
        setInputText(prev => prev + finalTranscript)
      }
    }

    recognitionRef.current.onerror = () => setIsRecording(false)
    recognitionRef.current.onend = () => setIsRecording(false)
    recognitionRef.current.start()
    setIsRecording(true)
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsRecording(false)
    }
  }

  const speakText = () => {
    if (!translatedText.trim()) return
    
    const utterance = new SpeechSynthesisUtterance(translatedText)
    utterance.lang = 'en-US'
    window.speechSynthesis.speak(utterance)
  }

  const downloadAsWord = () => {
    if (!translatedText.trim()) return

    const content = `Original Text:\n${inputText}\n\nTranslated Text:\n${translatedText}`
    const blob = new Blob([content], { type: 'application/msword' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'translation.doc'
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleTranslate = async () => {
    if (!inputText.trim()) return

    setLoading(true)
    setError('')
    
    try {
      const sourceLang = detectLanguage(inputText)
      setDetectedLang(sourceLang === 'ne_NP' ? 'Nepali' : 'Sinhala')
      
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await axios.post<TranslationResponse>(`${API_BASE}/translate`, {
        text: inputText,
        src_lang: sourceLang,
        tgt_lang: 'en_XX'
      }, {
        timeout: 120000
      })
      
      console.log('Translation response:', response.data)
      const translation = response.data.translated_text || 'No translation received'
      setTranslatedText(translation)
      
      // Show success message with animation
      if (translation && translation !== 'No translation received') {
        setTimeout(() => {
          const outputElement = document.querySelector('textarea[readonly]') as HTMLTextAreaElement
          if (outputElement) {
            outputElement.style.backgroundColor = '#e8f5e8'
            setTimeout(() => {
              outputElement.style.backgroundColor = '#f0f8ff'
            }, 1000)
          }
        }, 100)
      }
    } catch (err: any) {
      console.error('Translation error:', err)
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        setError('Backend server is not running. Start the backend with: cd backend && python main.py')
      } else {
        const errorMessage = err.response?.data?.detail || err.message || 'Translation failed. Please try again.'
        setError(errorMessage)
      }
      setTranslatedText('')
    } finally {
      setLoading(false)
    }
  }



  return (
    <>
      <div className="translator-shrine">
      <div className="shrine-header">
        <h1 className="shrine-title">{t('translate.title').toUpperCase()}</h1>
        <div className="decorative-border"></div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="source-chamber">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ color: '#8b4513', fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>
              Nepali / Sinhala {detectedLang && `(${detectedLang} detected)`}
            </h3>
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className="voice-btn"
              style={{ 
                background: isRecording ? 'var(--accent)' : 'var(--bg-accent)'
              }}
            >
              {isRecording ? '⏹️' : '🎤'}
            </button>
          </div>
          
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t('translate.placeholder')}
            className="sacred-textarea"
          />
        </div>

        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleTranslate}
            disabled={loading || !inputText.trim()}
            className="transform-btn"
          >
            {loading ? t('translate.loading').toUpperCase() : t('translate.button').toUpperCase()}
          </button>
        </div>

        <div className="target-chamber">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ color: '#8b4513', fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>English</h3>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                onClick={speakText}
                disabled={!translatedText}
                className="voice-btn"
                style={{ 
                  background: translatedText ? 'var(--secondary)' : 'var(--bg-accent)',
                  opacity: translatedText ? 1 : 0.5
                }}
              >
                🔊
              </button>
              <button
                onClick={downloadAsWord}
                disabled={!translatedText}
                className="voice-btn"
                style={{ 
                  background: translatedText ? 'var(--primary)' : 'var(--bg-accent)',
                  opacity: translatedText ? 1 : 0.5
                }}
              >
                📥
              </button>
            </div>
          </div>
          
          <textarea
            value={translatedText}
            readOnly
            placeholder="Translation will appear here..."
            className="sacred-textarea"
            style={{ 
              backgroundColor: '#f0f8ff', 
              minHeight: '200px',
              border: '3px solid #daa520',
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#2F1B14'
            }}
          />
        </div>
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-100 border-2 border-red-300 text-red-700 rounded-xl shadow-md">
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
    </>
  )
}