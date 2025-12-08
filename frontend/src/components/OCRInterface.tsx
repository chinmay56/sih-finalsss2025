'use client'

import { useState } from 'react'
import axios from 'axios'

export default function OCRInterface() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [extractedText, setExtractedText] = useState('')
  const [loading, setLoading] = useState(false)
  const [ocrType, setOcrType] = useState<'printed' | 'handwritten'>('printed')

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setExtractedText('')
    }
  }

  const handleExtractText = async () => {
    if (!selectedFile) return

    setLoading(true)
    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const endpoint = ocrType === 'printed' ? '/ocr/printed' : '/ocr/handwritten'
      const response = await axios.post(`http://localhost:8000${endpoint}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      setExtractedText(response.data.extracted_text)
    } catch (error) {
      console.error('OCR failed:', error)
      setExtractedText('Text extraction failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Text Extraction</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Select OCR Type:</label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="printed"
              checked={ocrType === 'printed'}
              onChange={(e) => setOcrType(e.target.value as 'printed')}
              className="mr-2"
            />
            Printed Text (Tesseract OCR)
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="handwritten"
              checked={ocrType === 'handwritten'}
              onChange={(e) => setOcrType(e.target.value as 'handwritten')}
              className="mr-2"
            />
            Handwritten Text (Google Vision AI)
          </label>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      <button
        onClick={handleExtractText}
        disabled={!selectedFile || loading}
        className="bg-blue-500 text-white px-6 py-2 rounded disabled:bg-gray-300"
      >
        {loading ? 'Extracting...' : `Extract ${ocrType} Text`}
      </button>

      {extractedText && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Extracted Text:</h3>
          <textarea
            value={extractedText}
            readOnly
            className="w-full h-32 p-3 border rounded resize-none"
          />
        </div>
      )}
    </div>
  )
}