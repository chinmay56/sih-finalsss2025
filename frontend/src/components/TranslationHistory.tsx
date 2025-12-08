'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'

export default function TranslationHistory() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const response = await axios.get('http://localhost:8000/history')
      setHistory(response.data.translations)
    } catch (error) {
      console.error('Failed to fetch history:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-8 p-4 border rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Translation History</h3>
        <button 
          onClick={fetchHistory}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {loading ? 'Loading...' : 'Load History'}
        </button>
      </div>
      
      {history.length > 0 && (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {history.map((item: any, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded border-l-4 border-blue-400">
              <div className="text-sm text-gray-600 mb-1">
                {item.source_lang} → {item.target_lang}
              </div>
              <div className="font-medium">{item.source_text}</div>
              <div className="text-gray-700">{item.translated_text}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}