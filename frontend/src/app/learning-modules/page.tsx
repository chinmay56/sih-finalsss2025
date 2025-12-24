'use client'

import { useState, useRef, useEffect } from 'react'
import Layout from '../../components/Layout'
import '../cultural-styles.css'

export default function LearningPage() {
  const [activeModule, setActiveModule] = useState<string | null>(null)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices()
      setVoices(availableVoices)
      console.log('Available voices:', availableVoices.map(v => `${v.name} (${v.lang})`))
    }
    loadVoices()
    speechSynthesis.onvoiceschanged = loadVoices
  }, [])

  const speak = (text: string, lang = 'ne-NP') => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang
      utterance.rate = 0.8
      utterance.volume = 1.0

      const voice = voices.find(v => v.lang.startsWith(lang.split('-')[0]))
      if (voice) {
        utterance.voice = voice
        console.log(`Using voice: ${voice.name}`)
      } else {
        console.warn(`No ${lang} voice found. Using default.`)
      }

      speechSynthesis.speak(utterance)
    }
  }

  const handleModuleClick = (module: string) => {
    setActiveModule(activeModule === module ? null : module)
    // Auto-scroll to content after state update
    setTimeout(() => {
      if (contentRef.current && module !== activeModule) {
        contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  const vocabularyWords = [
    { nepali: 'नमस्ते', english: 'hello', category: 'greetings', sentence: 'नमस्ते साथी।', translation: 'Hello friend.' },
    { nepali: 'धन्यवाद', english: 'thank you', category: 'greetings', sentence: 'धन्यवाद दाजु।', translation: 'Thank you brother.' },
    { nepali: 'आमा', english: 'mother', category: 'family', sentence: 'आमा घरमा छिन्।', translation: 'Mother is at home.' },
    { nepali: 'बुबा', english: 'father', category: 'family', sentence: 'बुबा काममा जानुहुन्छ।', translation: 'Father goes to work.' },
    { nepali: 'पानी', english: 'water', category: 'daily', sentence: 'पानी पिउनुपर्छ।', translation: 'One must drink water.' },
    { nepali: 'खाना', english: 'food', category: 'daily', sentence: 'खाना खानुपर्छ।', translation: 'One must eat food.' }
  ]

  const nextWord = () => {
    setCurrentWordIndex((prev) => (prev + 1) % vocabularyWords.length)
  }

  const prevWord = () => {
    setCurrentWordIndex((prev) => (prev - 1 + vocabularyWords.length) % vocabularyWords.length)
  }


  return (
    <Layout>

      <div className="knowledge-temple">
        <div className="temple-header">
          <h2 className="temple-title">LEARNING MODULES</h2>
          <div className="offline-badge">
            <span>⚡</span> Interactive Learning • Progress Tracking
          </div>
          <div className="temple-ornament">🏛️</div>
        </div>

        <div className="learning-mandala">
          <div className={`learning-petal ${activeModule === 'alphabets' ? 'active' : ''}`} onClick={() => handleModuleClick('alphabets')}>
            <div className="petal-icon">⏰</div>
            <h3>Alphabets & Scripts</h3>
            <p>Learn Devanagari & Sinhala scripts</p>
            <div className="module-stats">48 Devanagari + 61 Sinhala characters</div>
          </div>
          <div className={`learning-petal ${activeModule === 'vocabulary' ? 'active' : ''}`} onClick={() => handleModuleClick('vocabulary')}>
            <div className="petal-icon">📊</div>
            <h3>Vocabulary Builder</h3>
            <p>Build vocabulary with interactive quizzes</p>
            <div className="module-stats">200+ essential words</div>
          </div>
          <div className={`learning-petal ${activeModule === 'grammar' ? 'active' : ''}`} onClick={() => handleModuleClick('grammar')}>
            <div className="petal-icon">⚖️</div>
            <h3>Grammar Rules</h3>
            <p>Master grammar rules and sentence formation</p>
            <div className="module-stats">SOV structure + verb conjugations</div>
          </div>
          <div className={`learning-petal ${activeModule === 'stories' ? 'active' : ''}`} onClick={() => handleModuleClick('stories')}>
            <div className="petal-icon">🌸</div>
            <h3>Stories & Poems</h3>
            <p>Cultural stories and poems</p>
            <div className="module-stats">5 folk tales + cultural insights</div>
          </div>
        </div>

        <div ref={contentRef}></div>

        {!activeModule && (
          <div style={{ marginTop: '30px', padding: '30px', background: 'linear-gradient(135deg, #f5f1e8 0%, #e8dcc0 100%)', borderRadius: '20px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.5rem', color: '#8b4513', marginBottom: '15px' }}>Welcome to Interactive Learning</h3>
            <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '20px' }}>Click on any module above to start your cultural language journey</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginTop: '25px' }}>
              <div style={{ background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                <h4 style={{ color: '#8b4513', marginBottom: '10px' }}>📚 Learn Scripts</h4>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>Master Devanagari and Sinhala writing systems with interactive practice</p>
              </div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                <h4 style={{ color: '#8b4513', marginBottom: '10px' }}>🎯 Build Vocabulary</h4>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>Expand your word knowledge with categorized learning and quizzes</p>
              </div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                <h4 style={{ color: '#8b4513', marginBottom: '10px' }}>⚖️ Grammar Mastery</h4>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>Understand sentence structure and grammar rules with examples</p>
              </div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                <h4 style={{ color: '#8b4513', marginBottom: '10px' }}>📖 Cultural Stories</h4>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>Explore folk tales and poems with cultural insights</p>
              </div>
            </div>
          </div>
        )}

        {activeModule === 'alphabets' && (
          <div style={{ marginTop: '30px', padding: '30px', background: 'linear-gradient(135deg, #fff8dc 0%, #f5deb3 100%)', borderRadius: '20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <h3 style={{ fontSize: '2rem', color: '#8b4513', marginBottom: '10px' }}>📝 Alphabets & Scripts Mastery</h3>
              <p style={{ fontSize: '1.1rem', color: '#666' }}>Learn to read and write Devanagari and Sinhala characters</p>
            </div>

            <div style={{ marginBottom: '40px' }}>
              <h4 style={{ fontSize: '1.5rem', color: '#8b4513', marginBottom: '20px', textAlign: 'center' }}>🇳🇵 Devanagari Vowels (स्वर)</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '15px' }}>
                {[
                  { char: 'अ', trans: 'a', word: 'अम्मा', meaning: 'mother', tip: 'Short vowel sound like "uh"' },
                  { char: 'आ', trans: 'aa', word: 'आमा', meaning: 'mother', tip: 'Long vowel sound like "ah"' },
                  { char: 'इ', trans: 'i', word: 'इनार', meaning: 'well', tip: 'Short vowel sound like "i" in bit' },
                  { char: 'ई', trans: 'ii', word: 'ईश्वर', meaning: 'god', tip: 'Long vowel sound like "ee"' },
                  { char: 'उ', trans: 'u', word: 'उल्लू', meaning: 'owl', tip: 'Short vowel sound like "u" in put' },
                  { char: 'ऊ', trans: 'uu', word: 'ऊन', meaning: 'wool', tip: 'Long vowel sound like "oo"' },
                  { char: 'ए', trans: 'e', word: 'एक', meaning: 'one', tip: 'Sound like "ay" in say' },
                  { char: 'ऐ', trans: 'ai', word: 'ऐना', meaning: 'mirror', tip: 'Diphthong sound "ai"' },
                  { char: 'ओ', trans: 'o', word: 'ओठ', meaning: 'lip', tip: 'Sound like "o" in go' },
                  { char: 'औ', trans: 'au', word: 'औषधि', meaning: 'medicine', tip: 'Diphthong sound "au"' },
                  { char: 'अं', trans: 'am', word: 'अंग', meaning: 'body part', tip: 'Nasal sound with "m"' },
                  { char: 'अः', trans: 'ah', word: 'अतः', meaning: 'therefore', tip: 'Aspirated ending sound' }
                ].map((item, i) => (
                  <div key={i} style={{ background: 'white', padding: '20px', textAlign: 'center', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', transition: 'transform 0.3s ease' }}
                    onClick={() => {
                      speak(item.char, 'ne-NP')
                      alert(`Character: ${item.char} (${item.trans})\n\nExample Word: ${item.word} = ${item.meaning}\n\nPronunciation Tip: ${item.tip}\n\nClick 🔊 to hear the sound!`)
                    }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '8px', color: '#8b4513' }}>{item.char}</div>
                    <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '4px' }}>{item.trans}</div>
                    <div style={{ fontSize: '0.8rem', color: '#8b4513', marginBottom: '4px' }}>{item.word}</div>
                    <div style={{ fontSize: '0.7rem', color: '#999', marginBottom: '8px' }}>{item.meaning}</div>
                    <div style={{ fontSize: '1rem' }}>🔊</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '40px' }}>
              <h4 style={{ fontSize: '1.5rem', color: '#8b4513', marginBottom: '20px', textAlign: 'center' }}>🇳🇵 Devanagari Consonants (व्यञ्जन)</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '12px' }}>
                {[
                  { char: 'क', trans: 'ka', word: 'कमल', meaning: 'lotus' },
                  { char: 'ख', trans: 'kha', word: 'खुसी', meaning: 'happiness' },
                  { char: 'ग', trans: 'ga', word: 'गाई', meaning: 'cow' },
                  { char: 'घ', trans: 'gha', word: 'घर', meaning: 'house' },
                  { char: 'च', trans: 'cha', word: 'चन्द्र', meaning: 'moon' },
                  { char: 'छ', trans: 'chha', word: 'छाता', meaning: 'umbrella' },
                  { char: 'ज', trans: 'ja', word: 'जल', meaning: 'water' },
                  { char: 'झ', trans: 'jha', word: 'झण्डा', meaning: 'flag' },
                  { char: 'ट', trans: 'ta', word: 'टोपी', meaning: 'hat' },
                  { char: 'ठ', trans: 'tha', word: 'ठूलो', meaning: 'big' },
                  { char: 'ड', trans: 'da', word: 'डमरु', meaning: 'drum' },
                  { char: 'ढ', trans: 'dha', word: 'ढुङ्गा', meaning: 'stone' },
                  { char: 'त', trans: 'ta', word: 'तारा', meaning: 'star' },
                  { char: 'थ', trans: 'tha', word: 'थाली', meaning: 'plate' },
                  { char: 'द', trans: 'da', word: 'दाल', meaning: 'lentil' },
                  { char: 'ध', trans: 'dha', word: 'धन', meaning: 'wealth' },
                  { char: 'न', trans: 'na', word: 'नाम', meaning: 'name' },
                  { char: 'प', trans: 'pa', word: 'पानी', meaning: 'water' },
                  { char: 'फ', trans: 'pha', word: 'फूल', meaning: 'flower' },
                  { char: 'ब', trans: 'ba', word: 'बाघ', meaning: 'tiger' },
                  { char: 'भ', trans: 'bha', word: 'भालु', meaning: 'bear' },
                  { char: 'म', trans: 'ma', word: 'माया', meaning: 'love' },
                  { char: 'य', trans: 'ya', word: 'यात्रा', meaning: 'journey' },
                  { char: 'र', trans: 'ra', word: 'रङ्ग', meaning: 'color' },
                  { char: 'ल', trans: 'la', word: 'लामो', meaning: 'long' },
                  { char: 'व', trans: 'wa', word: 'वन', meaning: 'forest' },
                  { char: 'श', trans: 'sha', word: 'शान्ति', meaning: 'peace' },
                  { char: 'ष', trans: 'shha', word: 'षड्यन्त्र', meaning: 'conspiracy' },
                  { char: 'स', trans: 'sa', word: 'सूर्य', meaning: 'sun' },
                  { char: 'ह', trans: 'ha', word: 'हावा', meaning: 'wind' },
                  { char: 'क्ष', trans: 'ksha', word: 'क्षेत्र', meaning: 'field' },
                  { char: 'त्र', trans: 'tra', word: 'त्रिशूल', meaning: 'trident' }
                ].map((item, i) => (
                  <div key={i} style={{ background: 'white', padding: '15px', textAlign: 'center', borderRadius: '10px', cursor: 'pointer', boxShadow: '0 3px 10px rgba(0,0,0,0.1)', transition: 'transform 0.3s ease' }}
                    onClick={() => {
                      speak(item.char, 'ne-NP')
                      alert(`Consonant: ${item.char} (${item.trans})\n\nExample: ${item.word} = ${item.meaning}`)
                    }}>
                    <div style={{ fontSize: '2rem', marginBottom: '5px', color: '#8b4513' }}>{item.char}</div>
                    <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '3px' }}>{item.trans}</div>
                    <div style={{ fontSize: '0.7rem', color: '#8b4513' }}>{item.word}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '40px' }}>
              <h4 style={{ fontSize: '1.5rem', color: '#228b22', marginBottom: '20px', textAlign: 'center' }}>🇱🇰 Sinhala Vowels (ස්වර)</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '15px' }}>
                {[
                  { char: 'අ', trans: 'a', word: 'අම්මා', meaning: 'mother', tip: 'Short vowel, circular shape' },
                  { char: 'ආ', trans: 'aa', word: 'ආයුබෝවන්', meaning: 'hello', tip: 'Long vowel with extension' },
                  { char: 'ඇ', trans: 'ae', word: 'ඇස', meaning: 'eye', tip: 'Modified vowel sound' },
                  { char: 'ඈ', trans: 'aae', word: 'ඈත', meaning: 'far', tip: 'Extended ae sound' },
                  { char: 'ඉ', trans: 'i', word: 'ඉරිදා', meaning: 'sun', tip: 'Short i sound' },
                  { char: 'ඊ', trans: 'ii', word: 'ඊළඟ', meaning: 'next', tip: 'Long i sound' },
                  { char: 'උ', trans: 'u', word: 'උයන', meaning: 'garden', tip: 'Short u sound' },
                  { char: 'ඌ', trans: 'uu', word: 'ඌන', meaning: 'deficient', tip: 'Long u sound' },
                  { char: 'එ', trans: 'e', word: 'එක', meaning: 'one', tip: 'Short e sound' },
                  { char: 'ඒ', trans: 'ee', word: 'ඒක', meaning: 'that', tip: 'Long e sound' },
                  { char: 'ඔ', trans: 'o', word: 'ඔබ', meaning: 'you', tip: 'Short o sound' },
                  { char: 'ඕ', trans: 'oo', word: 'ඕනෑ', meaning: 'want', tip: 'Long o sound' }
                ].map((item, i) => (
                  <div key={i} style={{ background: 'white', padding: '20px', textAlign: 'center', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', transition: 'transform 0.3s ease' }}
                    onClick={() => {
                      speak(item.char, 'si-LK')
                      alert(`Character: ${item.char} (${item.trans})\n\nExample Word: ${item.word} = ${item.meaning}\n\nWriting Tip: ${item.tip}\n\nClick 🔊 to hear the sound!`)
                    }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '8px', color: '#228b22' }}>{item.char}</div>
                    <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '4px' }}>{item.trans}</div>
                    <div style={{ fontSize: '0.8rem', color: '#228b22', marginBottom: '4px' }}>{item.word}</div>
                    <div style={{ fontSize: '0.7rem', color: '#999', marginBottom: '8px' }}>{item.meaning}</div>
                    <div style={{ fontSize: '1rem' }}>🔊</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '1.5rem', color: '#228b22', marginBottom: '20px', textAlign: 'center' }}>🇱🇰 Sinhala Consonants (ව්යඤ්ජන)</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '12px' }}>
                {[
                  { char: 'ක', trans: 'ka', word: 'කමල', meaning: 'lotus' },
                  { char: 'ඛ', trans: 'kha', word: 'ඛනිජ', meaning: 'mineral' },
                  { char: 'ග', trans: 'ga', word: 'ගම', meaning: 'village' },
                  { char: 'ඝ', trans: 'gha', word: 'ඝන', meaning: 'dense' },
                  { char: 'ච', trans: 'cha', word: 'චන්ද්‍ර', meaning: 'moon' },
                  { char: 'ඡ', trans: 'chha', word: 'ඡායා', meaning: 'shadow' },
                  { char: 'ජ', trans: 'ja', word: 'ජල', meaning: 'water' },
                  { char: 'ඣ', trans: 'jha', word: 'ඣන', meaning: 'meditation' },
                  { char: 'ට', trans: 'ta', word: 'ටෝපි', meaning: 'hat' },
                  { char: 'ඨ', trans: 'tha', word: 'ඨාන', meaning: 'place' },
                  { char: 'ඩ', trans: 'da', word: 'ඩම්බර', meaning: 'drum' },
                  { char: 'ඪ', trans: 'dha', word: 'ඪන', meaning: 'wealth' },
                  { char: 'ත', trans: 'ta', word: 'තරු', meaning: 'star' },
                  { char: 'ථ', trans: 'tha', word: 'ථාලම', meaning: 'plate' },
                  { char: 'ද', trans: 'da', word: 'දත', meaning: 'tooth' },
                  { char: 'ධ', trans: 'dha', word: 'ධන', meaning: 'wealth' },
                  { char: 'න', trans: 'na', word: 'නම', meaning: 'name' },
                  { char: 'ප', trans: 'pa', word: 'පාන', meaning: 'drink' },
                  { char: 'ඵ', trans: 'pha', word: 'ඵල', meaning: 'fruit' },
                  { char: 'බ', trans: 'ba', word: 'බල', meaning: 'strength' },
                  { char: 'භ', trans: 'bha', word: 'භාෂා', meaning: 'language' },
                  { char: 'ම', trans: 'ma', word: 'මල', meaning: 'flower' },
                  { char: 'ය', trans: 'ya', word: 'යාත්‍රා', meaning: 'journey' },
                  { char: 'ර', trans: 'ra', word: 'රස', meaning: 'taste' },
                  { char: 'ල', trans: 'la', word: 'ලස්සන', meaning: 'beautiful' },
                  { char: 'ව', trans: 'wa', word: 'වන', meaning: 'forest' },
                  { char: 'ශ', trans: 'sha', word: 'ශාන්ති', meaning: 'peace' },
                  { char: 'ෂ', trans: 'shha', word: 'ෂෝඩශ', meaning: 'sixteen' },
                  { char: 'ස', trans: 'sa', word: 'සූර්ය', meaning: 'sun' },
                  { char: 'හ', trans: 'ha', word: 'හවස', meaning: 'evening' },
                  { char: 'ළ', trans: 'la', word: 'ළමයා', meaning: 'child' },
                  { char: 'ෆ', trans: 'fa', word: 'ෆෝන්', meaning: 'phone' }
                ].map((item, i) => (
                  <div key={i} style={{ background: 'white', padding: '15px', textAlign: 'center', borderRadius: '10px', cursor: 'pointer', boxShadow: '0 3px 10px rgba(0,0,0,0.1)', transition: 'transform 0.3s ease' }}
                    onClick={() => {
                      speak(item.char, 'si-LK')
                      alert(`Consonant: ${item.char} (${item.trans})\n\nExample: ${item.word} = ${item.meaning}`)
                    }}>
                    <div style={{ fontSize: '2rem', marginBottom: '5px', color: '#228b22' }}>{item.char}</div>
                    <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '3px' }}>{item.trans}</div>
                    <div style={{ fontSize: '0.7rem', color: '#228b22' }}>{item.word}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeModule === 'vocabulary' && (
          <div style={{ marginTop: '30px', padding: '30px', background: 'linear-gradient(135deg, #f0fff0 0%, #e6ffe6 100%)', borderRadius: '20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <h3 style={{ fontSize: '2rem', color: '#228b22', marginBottom: '10px' }}>📚 Vocabulary Builder</h3>
              <p style={{ fontSize: '1.1rem', color: '#666' }}>Build your Nepali vocabulary with essential words and phrases</p>
            </div>

            <div style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', marginBottom: '25px' }}>
              <h4 style={{ color: '#228b22', marginBottom: '20px', textAlign: 'center' }}>🎯 Word Practice</h4>
              <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '10px', color: '#228b22' }}>{vocabularyWords[currentWordIndex].nepali}</div>
                <div style={{ fontSize: '1.5rem', marginBottom: '10px', color: '#666' }}>{vocabularyWords[currentWordIndex].english}</div>
                <div style={{ fontSize: '1rem', marginBottom: '15px', color: '#888', fontStyle: 'italic' }}>Category: {vocabularyWords[currentWordIndex].category}</div>

                <div style={{ background: '#f8fff8', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
                  <div style={{ fontSize: '1.1rem', color: '#228b22', marginBottom: '5px' }}>{vocabularyWords[currentWordIndex].sentence}</div>
                  <div style={{ fontSize: '1rem', color: '#666', fontStyle: 'italic' }}>{vocabularyWords[currentWordIndex].translation}</div>
                </div>

                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '20px' }}>
                  <button style={{ background: '#228b22', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer' }}
                    onClick={prevWord}>← Previous</button>
                  <button style={{ background: '#32cd32', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer' }}
                    onClick={() => speak(vocabularyWords[currentWordIndex].nepali, 'ne-NP')}>🔊 Listen</button>
                  <button style={{ background: '#228b22', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer' }}
                    onClick={nextWord}>Next →</button>
                </div>

                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                  Word {currentWordIndex + 1} of {vocabularyWords.length}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '25px' }}>
              {[
                { category: '👨👩👧👦 Family', words: ['आमा (mother)', 'बुबा (father)', 'दाजु (elder brother)', 'दिदी (elder sister)', 'भाइ (younger brother)', 'बहिनी (younger sister)', 'हजुरआमा (grandmother)', 'हजुरबुबा (grandfather)'] },
                { category: '🍽️ Food & Drinks', words: ['भात (rice)', 'दाल (lentils)', 'तरकारी (vegetables)', 'मासु (meat)', 'दूध (milk)', 'चिया (tea)', 'पानी (water)', 'रोटी (bread)'] },
                { category: '😊 Emotions', words: ['खुसी (happy)', 'दुःखी (sad)', 'रिसाएको (angry)', 'डराएको (scared)', 'आश्चर्य (surprised)', 'प्रेम (love)', 'घृणा (hate)', 'शान्त (peaceful)'] },
                { category: '🏠 Home & Objects', words: ['घर (house)', 'ढोका (door)', 'झ्याल (window)', 'ओछ्यान (bed)', 'टेबल (table)', 'कुर्सी (chair)', 'किताब (book)', 'कलम (pen)'] },
                { category: '🌿 Nature', words: ['रूख (tree)', 'फूल (flower)', 'पात (leaf)', 'पहाड (mountain)', 'नदी (river)', 'आकाश (sky)', 'तारा (star)', 'चन्द्रमा (moon)'] },
                { category: '🎨 Colors', words: ['रातो (red)', 'निलो (blue)', 'हरियो (green)', 'पहेंलो (yellow)', 'कालो (black)', 'सेतो (white)', 'खैरो (brown)', 'गुलाबी (pink)'] },
                { category: '🔢 Numbers', words: ['एक (one)', 'दुई (two)', 'तीन (three)', 'चार (four)', 'पाँच (five)', 'छ (six)', 'सात (seven)', 'आठ (eight)'] },
                { category: '⏰ Time & Days', words: ['दिन (day)', 'रात (night)', 'बिहान (morning)', 'साँझ (evening)', 'आइतबार (Sunday)', 'सोमबार (Monday)', 'मंगलबार (Tuesday)', 'बुधबार (Wednesday)'] }
              ].map((category, i) => (
                <div key={i} style={{ background: 'white', padding: '18px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                  <h4 style={{ color: '#228b22', marginBottom: '12px', textAlign: 'center', fontSize: '1rem' }}>{category.category}</h4>
                  {category.words.map((word, j) => (
                    <div key={j} style={{ marginBottom: '6px', padding: '6px', background: '#f8fff8', borderRadius: '5px', fontSize: '0.8rem', textAlign: 'center', cursor: 'pointer', transition: 'background 0.3s ease' }}
                      onClick={() => speak(word.split(' (')[0], 'ne-NP')}
                      onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => (e.target as HTMLDivElement).style.background = '#e8f5e8'}
                      onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => (e.target as HTMLDivElement).style.background = '#f8fff8'}>
                      {word}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div style={{ background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
              <h4 style={{ color: '#228b22', marginBottom: '20px', textAlign: 'center' }}>🎯 Advanced Vocabulary Practice</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                <div style={{ background: '#f0fff0', padding: '20px', borderRadius: '10px' }}>
                  <h5 style={{ color: '#228b22', marginBottom: '15px' }}>📝 Sentence Formation</h5>
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Pattern:</strong> Subject + Object + Verb
                  </div>
                  <div style={{ background: 'white', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}>
                    <div style={{ color: '#228b22', fontWeight: 'bold' }}>म + भात + खान्छु</div>
                    <div style={{ color: '#666', fontSize: '0.9rem' }}>I + rice + eat = I eat rice</div>
                  </div>
                  <div style={{ background: 'white', padding: '15px', borderRadius: '8px' }}>
                    <div style={{ color: '#228b22', fontWeight: 'bold' }}>उसले + किताब + पढ्छ</div>
                    <div style={{ color: '#666', fontSize: '0.9rem' }}>He/She + book + reads = He/She reads a book</div>
                  </div>
                </div>

                <div style={{ background: '#f0fff0', padding: '20px', borderRadius: '10px' }}>
                  <h5 style={{ color: '#228b22', marginBottom: '15px' }}>🔄 Common Phrases</h5>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {[
                      { nepali: 'तपाईंको नाम के हो?', english: 'What is your name?' },
                      { nepali: 'म नेपाली सिक्दै छु', english: 'I am learning Nepali' },
                      { nepali: 'यो कति हो?', english: 'How much is this?' },
                      { nepali: 'मलाई मद्दत चाहिन्छ', english: 'I need help' },
                      { nepali: 'धन्यवाद धेरै', english: 'Thank you very much' }
                    ].map((phrase, k) => (
                      <div key={k} style={{ background: 'white', padding: '10px', borderRadius: '6px', cursor: 'pointer' }}
                        onClick={() => speak(phrase.nepali, 'ne-NP')}>
                        <div style={{ color: '#228b22', fontSize: '0.9rem', fontWeight: 'bold' }}>{phrase.nepali}</div>
                        <div style={{ color: '#666', fontSize: '0.8rem' }}>{phrase.english}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
              <h4 style={{ color: '#228b22', marginBottom: '20px', textAlign: 'center' }}>🎯 Interactive Quiz</h4>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '15px', color: '#228b22' }}>नमस्ते</div>
                <p style={{ fontSize: '1.2rem', marginBottom: '20px', color: '#666' }}>What does this word mean?</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginBottom: '20px' }}>
                  {['Hello/Goodbye', 'Thank you', 'Please', 'Excuse me'].map((option, i) => (
                    <button key={i}
                      style={{
                        padding: '15px',
                        background: quizAnswer === i ? (i === 0 ? '#228b22' : '#dc3545') : (quizAnswer === null ? '#f0f0f0' : '#f0f0f0'),
                        color: quizAnswer === i ? 'white' : '#333',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease'
                      }}
                      onClick={() => {
                        setQuizAnswer(i)
                        setTimeout(() => {
                          alert(i === 0 ? '✅ Correct! नमस्ते means Hello/Goodbye\n\nThis is the most common greeting in Nepal!' : '❌ Try again! नमस्ते means Hello/Goodbye\n\nनमस्ते comes from Sanskrit meaning "I bow to you"')
                          setQuizAnswer(null)
                        }, 500)
                      }}>
                      {option}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                  <button style={{ background: '#228b22', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '20px', fontSize: '1rem', cursor: 'pointer' }}
                    onClick={() => speak('नमस्ते', 'ne-NP')}>
                    🔊 Hear Pronunciation
                  </button>
                  <button style={{ background: '#32cd32', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '20px', fontSize: '1rem', cursor: 'pointer' }}
                    onClick={() => alert('💡 Cultural Tip:\n\nनमस्ते is used both for hello and goodbye in Nepal. It\'s often accompanied by pressing palms together in front of the chest.')}>
                    💡 Cultural Tip
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeModule === 'grammar' && (
          <div style={{ marginTop: '30px', padding: '30px', background: 'linear-gradient(135deg, #fffacd 0%, #f0e68c 100%)', borderRadius: '20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <h3 style={{ fontSize: '2rem', color: '#b8860b', marginBottom: '10px' }}>⚖️ Grammar Mastery</h3>
              <p style={{ fontSize: '1.1rem', color: '#666' }}>Master Nepali grammar rules with comprehensive examples</p>
            </div>

            <div style={{ display: 'grid', gap: '25px' }}>
              {/* SOV Word Order */}
              <div style={{ background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                <h4 style={{ color: '#b8860b', marginBottom: '15px', fontSize: '1.3rem' }}>📝 SOV Word Order (Subject-Object-Verb)</h4>
                <p style={{ color: '#666', marginBottom: '20px', fontSize: '1rem' }}>Nepali follows SOV pattern, different from English SVO</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                  {[
                    { nepali: 'म भात खान्छु', english: 'I eat rice', breakdown: 'म (I) + भात (rice) + खान्छु (eat)' },
                    { nepali: 'उसले किताब पढ्छ', english: 'He/She reads a book', breakdown: 'उसले (he/she) + किताब (book) + पढ्छ (reads)' },
                    { nepali: 'बच्चाले खेल खेल्छन्', english: 'Children play games', breakdown: 'बच्चाले (children) + खेल (games) + खेल्छन् (play)' },
                    { nepali: 'हामी पानी पिउँछौं', english: 'We drink water', breakdown: 'हामी (we) + पानी (water) + पिउँछौं (drink)' }
                  ].map((example, i) => (
                    <div key={i} style={{ background: '#fffef7', padding: '15px', borderRadius: '10px', border: '2px solid #f0e68c' }}>
                      <div style={{ fontSize: '1.2rem', color: '#b8860b', marginBottom: '5px', fontWeight: 'bold' }}>{example.nepali}</div>
                      <div style={{ fontSize: '1rem', color: '#666', marginBottom: '8px', fontStyle: 'italic' }}>{example.english}</div>
                      <div style={{ fontSize: '0.8rem', color: '#888', background: '#f9f9f9', padding: '6px', borderRadius: '4px' }}>{example.breakdown}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verb Conjugations */}
              <div style={{ background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                <h4 style={{ color: '#b8860b', marginBottom: '15px', fontSize: '1.3rem' }}>🔄 Verb Conjugations</h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                  <div>
                    <h5 style={{ color: '#b8860b', marginBottom: '10px' }}>Present Tense</h5>
                    {[
                      { nepali: 'म जान्छु', english: 'I go' },
                      { nepali: 'तिमी जान्छौ', english: 'You go' },
                      { nepali: 'ऊ जान्छ', english: 'He/She goes' },
                      { nepali: 'हामी जान्छौं', english: 'We go' }
                    ].map((verb, j) => (
                      <div key={j} style={{ background: '#fffef7', padding: '8px', borderRadius: '6px', marginBottom: '5px' }}>
                        <div style={{ fontSize: '0.9rem', color: '#b8860b', fontWeight: 'bold' }}>{verb.nepali}</div>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>{verb.english}</div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h5 style={{ color: '#b8860b', marginBottom: '10px' }}>Past Tense</h5>
                    {[
                      { nepali: 'म गएँ', english: 'I went' },
                      { nepali: 'तिमी गयौ', english: 'You went' },
                      { nepali: 'ऊ गयो', english: 'He/She went' },
                      { nepali: 'हामी गयौं', english: 'We went' }
                    ].map((verb, j) => (
                      <div key={j} style={{ background: '#fffef7', padding: '8px', borderRadius: '6px', marginBottom: '5px' }}>
                        <div style={{ fontSize: '0.9rem', color: '#b8860b', fontWeight: 'bold' }}>{verb.nepali}</div>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>{verb.english}</div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h5 style={{ color: '#b8860b', marginBottom: '10px' }}>Future Tense</h5>
                    {[
                      { nepali: 'म जानेछु', english: 'I will go' },
                      { nepali: 'तिमी जानेछौ', english: 'You will go' },
                      { nepali: 'ऊ जानेछ', english: 'He/She will go' },
                      { nepali: 'हामी जानेछौं', english: 'We will go' }
                    ].map((verb, j) => (
                      <div key={j} style={{ background: '#fffef7', padding: '8px', borderRadius: '6px', marginBottom: '5px' }}>
                        <div style={{ fontSize: '0.9rem', color: '#b8860b', fontWeight: 'bold' }}>{verb.nepali}</div>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>{verb.english}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Postpositions */}
              <div style={{ background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                <h4 style={{ color: '#b8860b', marginBottom: '15px', fontSize: '1.3rem' }}>📍 Postpositions (After Words)</h4>
                <p style={{ color: '#666', marginBottom: '15px' }}>Unlike English prepositions, Nepali uses postpositions that come after nouns</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                  {[
                    { nepali: 'घरमा', english: 'in the house', breakdown: 'घर (house) + मा (in)' },
                    { nepali: 'टेबलमाथि', english: 'on the table', breakdown: 'टेबल (table) + माथि (on)' },
                    { nepali: 'स्कूलबाट', english: 'from school', breakdown: 'स्कूल (school) + बाट (from)' },
                    { nepali: 'बजारतिर', english: 'towards market', breakdown: 'बजार (market) + तिर (towards)' },
                    { nepali: 'मित्रसँग', english: 'with friend', breakdown: 'मित्र (friend) + सँग (with)' },
                    { nepali: 'पानीबिना', english: 'without water', breakdown: 'पानी (water) + बिना (without)' }
                  ].map((example, k) => (
                    <div key={k} style={{ background: '#fffef7', padding: '12px', borderRadius: '8px', border: '1px solid #f0e68c' }}>
                      <div style={{ fontSize: '1.1rem', color: '#b8860b', fontWeight: 'bold', marginBottom: '4px' }}>{example.nepali}</div>
                      <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '6px', fontStyle: 'italic' }}>{example.english}</div>
                      <div style={{ fontSize: '0.8rem', color: '#888' }}>{example.breakdown}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Question Formation */}
              <div style={{ background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                <h4 style={{ color: '#b8860b', marginBottom: '15px', fontSize: '1.3rem' }}>❓ Question Formation</h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                  <div>
                    <h5 style={{ color: '#b8860b', marginBottom: '10px' }}>WH-Questions</h5>
                    {[
                      { nepali: 'के हो?', english: 'What is it?', word: 'के (what)' },
                      { nepali: 'को हो?', english: 'Who is it?', word: 'को (who)' },
                      { nepali: 'कहाँ छ?', english: 'Where is it?', word: 'कहाँ (where)' },
                      { nepali: 'कहिले?', english: 'When?', word: 'कहिले (when)' },
                      { nepali: 'किन कारणले?', english: 'Why?', word: 'किन (why)' }
                    ].map((q, l) => (
                      <div key={l} style={{ background: '#fffef7', padding: '10px', borderRadius: '6px', marginBottom: '8px' }}>
                        <div style={{ fontSize: '1rem', color: '#b8860b', fontWeight: 'bold' }}>{q.nepali}</div>
                        <div style={{ fontSize: '0.9rem', color: '#666' }}>{q.english}</div>
                        <div style={{ fontSize: '0.8rem', color: '#888' }}>{q.word}</div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h5 style={{ color: '#b8860b', marginBottom: '10px' }}>Yes/No Questions</h5>
                    {[
                      { nepali: 'तपाईं नेपाली बोल्नुहुन्छ?', english: 'Do you speak Nepali?' },
                      { nepali: 'यो राम्रो हो?', english: 'Is this good?' },
                      { nepali: 'उ घरमा छ?', english: 'Is he/she at home?' },
                      { nepali: 'तिमी खुसी छौ?', english: 'Are you happy?' }
                    ].map((q, l) => (
                      <div key={l} style={{ background: '#fffef7', padding: '10px', borderRadius: '6px', marginBottom: '8px' }}>
                        <div style={{ fontSize: '0.95rem', color: '#b8860b', fontWeight: 'bold' }}>{q.nepali}</div>
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>{q.english}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Honorific System */}
              <div style={{ background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                <h4 style={{ color: '#b8860b', marginBottom: '15px', fontSize: '1.3rem' }}>🙏 Honorific System (Respect Levels)</h4>
                <p style={{ color: '#666', marginBottom: '15px' }}>Nepali has different levels of respect based on age, status, and relationship</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                  <div style={{ background: '#fff8dc', padding: '15px', borderRadius: '10px' }}>
                    <h5 style={{ color: '#b8860b', marginBottom: '10px' }}>Informal (तु)</h5>
                    <div style={{ fontSize: '0.9rem', marginBottom: '5px' }}>तँ कहाँ जान्छस्?</div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>Where are you going? (friends)</div>
                  </div>

                  <div style={{ background: '#fff8dc', padding: '15px', borderRadius: '10px' }}>
                    <h5 style={{ color: '#b8860b', marginBottom: '10px' }}>Formal (तिमी)</h5>
                    <div style={{ fontSize: '0.9rem', marginBottom: '5px' }}>तिमी कहाँ जान्छौ?</div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>Where are you going? (peers)</div>
                  </div>

                  <div style={{ background: '#fff8dc', padding: '15px', borderRadius: '10px' }}>
                    <h5 style={{ color: '#b8860b', marginBottom: '10px' }}>Respectful (तपाईं)</h5>
                    <div style={{ fontSize: '0.9rem', marginBottom: '5px' }}>तपाईं कहाँ जानुहुन्छ?</div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>Where are you going? (elders)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeModule === 'stories' && (
          <div style={{ marginTop: '30px', padding: '30px', background: 'linear-gradient(135deg, #ffeef8 0%, #f8e8ff 100%)', borderRadius: '20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <h3 style={{ fontSize: '2rem', color: '#8b008b', marginBottom: '10px' }}>📖 Cultural Stories & Poems</h3>
              <p style={{ fontSize: '1.1rem', color: '#666' }}>Explore Nepali and Sinhala culture through traditional tales</p>
            </div>

            <div style={{ display: 'grid', gap: '25px' }}>
              {/* Story 1: The Clever Fox */}
              <div style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h4 style={{ color: '#8b008b', fontSize: '1.5rem' }}>चतुर स्याल (The Clever Fox)</h4>
                  <span style={{ background: '#8b008b', color: 'white', padding: '5px 15px', borderRadius: '15px', fontSize: '0.9rem' }}>Nepali Folk Tale</span>
                </div>

                <div style={{ marginBottom: '25px' }}>
                  <div style={{ background: '#ffeef8', padding: '20px', borderRadius: '10px', marginBottom: '15px' }}>
                    <h5 style={{ color: '#8b008b', marginBottom: '10px' }}>📜 Nepali Text:</h5>
                    <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#333' }}>एक पटक एउटा चतुर स्याल थियो। ऊ जंगलमा बस्थ्यो। एक दिन ऊ धेरै भोकाएको थियो। ऊले एउटा कुखुरा देख्यो। स्यालले भन्यो, &quot;तिमी कति सुन्दर छौ!&quot; कुखुराले गीत गाउन थाल्यो। जब कुखुराले मुख खोल्यो, स्यालले उसलाई समात्यो।</p>
                  </div>

                  <div style={{ background: '#f8e8ff', padding: '20px', borderRadius: '10px', marginBottom: '15px' }}>
                    <h5 style={{ color: '#8b008b', marginBottom: '10px' }}>🌍 English Translation:</h5>
                    <p style={{ fontSize: '1rem', lineHeight: '1.6', color: '#666', fontStyle: 'italic' }}>Once there was a clever fox. He lived in the forest. One day he was very hungry. He saw a chicken. The fox said, &quot;How beautiful you are!&quot; The chicken started singing. When the chicken opened its mouth, the fox caught it.</p>
                  </div>

                  <div style={{ background: '#fff0f8', padding: '15px', borderRadius: '10px' }}>
                    <h5 style={{ color: '#8b008b', marginBottom: '10px' }}>💡 Moral Lesson:</h5>
                    <p style={{ fontSize: '1rem', color: '#8b008b', fontWeight: 'bold' }}>चापलुसीमा नपर्नुहोस्। (Don&apos;t fall for flattery.)</p>
                  </div>
                </div>
              </div>

              {/* Story 2: The Wise Elephant */}
              <div style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h4 style={{ color: '#228b22', fontSize: '1.5rem' }}>බුද්ධිමත් ඇලියා (The Wise Elephant)</h4>
                  <span style={{ background: '#228b22', color: 'white', padding: '5px 15px', borderRadius: '15px', fontSize: '0.9rem' }}>Sinhala Folk Tale</span>
                </div>

                <div style={{ marginBottom: '25px' }}>
                  <div style={{ background: '#f0fff0', padding: '20px', borderRadius: '10px', marginBottom: '15px' }}>
                    <h5 style={{ color: '#228b22', marginBottom: '10px' }}>📜 Sinhala Text:</h5>
                    <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#333' }}>එක කාලේ බුද්ධිමත් ඇලියකු සිටියාය। එය වනයේ ජීවත් වුයා। එක දිනක කුඩා වනයට ආවා। එය පියාසිට වුයා। ඇලියා කියුවා, &quot;මම ඔබට සහාය කරන්නම්।&quot; ඇලියා කුඩාව පිටින් ගෙන ගියා।</p>
                  </div>

                  <div style={{ background: '#e6ffe6', padding: '20px', borderRadius: '10px', marginBottom: '15px' }}>
                    <h5 style={{ color: '#228b22', marginBottom: '10px' }}>🌍 English Translation:</h5>
                    <p style={{ fontSize: '1rem', lineHeight: '1.6', color: '#666', fontStyle: 'italic' }}>Once there was a wise elephant. He lived in the forest. One day a small mouse came to the forest. He was thirsty. The elephant said, &quot;I will help you.&quot; The elephant brought the mouse to water.</p>
                  </div>

                  <div style={{ background: '#f0fff0', padding: '15px', borderRadius: '10px' }}>
                    <h5 style={{ color: '#228b22', marginBottom: '10px' }}>💡 Moral Lesson:</h5>
                    <p style={{ fontSize: '1rem', color: '#228b22', fontWeight: 'bold' }}>සියලුම සහාය කරන්න ඔනේ। (Everyone should help each other.)</p>
                  </div>
                </div>
              </div>

              {/* Story 3: The Mountain and the River */}
              <div style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h4 style={{ color: '#b8860b', fontSize: '1.5rem' }}>पहाड र नदी (The Mountain and the River)</h4>
                  <span style={{ background: '#b8860b', color: 'white', padding: '5px 15px', borderRadius: '15px', fontSize: '0.9rem' }}>Nepali Wisdom Tale</span>
                </div>

                <div style={{ marginBottom: '25px' }}>
                  <div style={{ background: '#fffacd', padding: '20px', borderRadius: '10px', marginBottom: '15px' }}>
                    <h5 style={{ color: '#b8860b', marginBottom: '10px' }}>📜 Nepali Text:</h5>
                    <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#333' }}>एक उच्चो पहाड र एउटी सानो नदी थिए। पहाडले भन्यो, &quot;म सबैभन्दा ठूलो छु।&quot; नदीले भन्यो, &quot;म सबैभन्दा छिटो छु, तर म तिमीलाई काट्न सक्छु।&quot; समयसँगै नदीले पहाडलाई काट्यो र सुन्दर उपत्यका बनायो।</p>
                  </div>

                  <div style={{ background: '#f0e68c', padding: '20px', borderRadius: '10px', marginBottom: '15px' }}>
                    <h5 style={{ color: '#b8860b', marginBottom: '10px' }}>🌍 English Translation:</h5>
                    <p style={{ fontSize: '1rem', lineHeight: '1.6', color: '#666', fontStyle: 'italic' }}>There was a tall mountain and a small river. The mountain said, &quot;I am the biggest of all.&quot; The river said, &quot;I am the smallest of all, but I can cut through you.&quot; Over time, the river cut through the mountain and created beautiful valleys.</p>
                  </div>

                  <div style={{ background: '#fffef7', padding: '15px', borderRadius: '10px' }}>
                    <h5 style={{ color: '#b8860b', marginBottom: '10px' }}>💡 Moral Lesson:</h5>
                    <p style={{ fontSize: '1rem', color: '#b8860b', fontWeight: 'bold' }}>धैर्य र निरन्तरताले ठूला काम गर्छ। (Patience and persistence accomplish great things.)</p>
                  </div>
                </div>
              </div>


            </div>
          </div>
        )}

      </div>


      <style jsx>{`
        .learning-petal {
          transition: all 0.3s ease;
          position: relative;
        }
        .learning-petal.active {
          transform: scale(1.05);
          box-shadow: 0 8px 25px rgba(139, 69, 19, 0.3);
          border: 3px solid var(--accent);
        }
        .learning-petal.active::after {
          content: '✓';
          position: absolute;
          top: 10px;
          right: 10px;
          background: var(--accent);
          color: white;
          width: 25px;
          height: 25px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: bold;
        }
        .module-stats {
          font-size: 0.8rem;
          color: var(--text-accent);
          margin-top: 10px;
          padding: 5px 10px;
          background: rgba(139, 69, 19, 0.1);
          border-radius: 10px;
          font-weight: 500;
        }
      `}</style>

    </Layout>
  )
}