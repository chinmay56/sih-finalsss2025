'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import '../cultural-styles.css'
import '../module-features.css'

export default function LiteratureCentre() {
  const [language, setLanguage] = useState('en')
  const [theme, setTheme] = useState('light')
  const [uiTheme, setUiTheme] = useState('nepali-theme')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedManuscript, setSelectedManuscript] = useState<any>(null)
  const [showEbook, setShowEbook] = useState(false)
  const pathname = usePathname()



  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleManuscriptClick = (manuscript: any) => {
    setSelectedManuscript(manuscript)
    setShowEbook(true)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getEbookContent = (manuscript: any) => {
    const contents = {
      'रामायण': {
        downloadUrl: 'https://archive.org/details/ShrimadValmikiRamayan-SanskritTextWithHindiTranslation-DpSharma10/ShrimadValmikiRamayan-SktHindi-DpSharmaVol01-BalaKanda1927/',
        description: 'Download the complete Valmiki Ramayana with Sanskrit text and Hindi translation. Use our browser extension for instant English translation.'
      },
      'महाभारत': {
        downloadUrl: 'https://archive.org/details/mahabharata-by-gita-press-in-hindi-and-sanskrit/Mahabharata%20Volume%201/',
        description: 'Download the complete Mahabharata by Gita Press with Sanskrit text and Hindi translation. Use our extension for English translation.'
      },
      'भगवद्गीता': {
        downloadUrl: 'https://sanskritacademy.delhi.gov.in/sites/default/files/2022-09/final_geeta.pdf',
        description: 'Download the complete Bhagavad Gita from Sanskrit Academy Delhi with original Sanskrit verses. Use our extension for English translation.'
      },
      'मुना मदन': {
        downloadUrl: 'https://dn721801.ca.archive.org/0/items/MunaMadan/MunaMadan.pdf',
        description: 'Download the complete Muna Madan PDF by Laxmi Prasad Devkota and translate Nepali text seamlessly with our extension.'
      },
      'शिरीषको फूल': {
        downloadUrl: 'https://www.scribd.com/document/754653755/Sirish-ko-Phool',
        description: 'Read Bishnu Kumari Waiba\'s beautiful essays on life and nature. Use our extension to translate Nepali text.'
      },
      'සිරි සංගරාව': {
        downloadUrl: 'https://www.qsl.net/4s7vj/kavi/LoWedaSangara.pdf',
        description: 'Download classical Sinhala poetry collection with traditional verses. Use our extension to translate Sinhala text to English.'
      },
      'गिरिश कर्णको गीत': {
        downloadUrl: 'https://kavitakosh.org/kk/%E0%A4%AC%E0%A4%BF%E0%A4%AF%E0%A4%BE%E0%A4%B9_%E0%A4%B8%E0%A4%81_%E0%A4%A6%E0%A5%8D%E0%A4%B5%E0%A4%BF%E0%A4%B0%E0%A4%BE%E0%A4%97%E0%A4%AE%E0%A4%A8_%E0%A4%A7%E0%A4%B0%E0%A4%BF%E0%A4%95_%E0%A4%97%E0%A5%80%E0%A4%A4_/_%E0%A4%AE%E0%A5%88%E0%A4%A5%E0%A4%BF%E0%A4%B2%E0%A5%80_%E0%A4%B2%E0%A5%8B%E0%A4%95%E0%A4%97%E0%A5%80%E0%A4%A4_%E0%A4%B8%E0%A4%82%E0%A4%97%E0%A5%8D%E0%A4%B0%E0%A4%B9',
        description: 'Explore traditional Nepali folk songs and cultural music from Kavitakosh collection. Use our extension to translate lyrics.'
      },
      'කුමරිහිමි': {
        downloadUrl: 'https://ia902908.us.archive.org/33/items/in.ernet.dli.2015.427691/2015.427691.PadhiniCharitraChopaiAC5373.pdf',
        description: 'Download classical Sinhala legend and historical tales. Use our extension to translate Sinhala text to English.'
      },
      'සකුන්තලා': {
        downloadUrl: 'https://share.google/ReDAqhwi9phhlhLZe',
        description: 'Access classical Sinhala drama adaptation of Kalidasa\'s Sakuntala. Use our extension to translate dramatic text.'
      }
    }
    return contents[manuscript.title as keyof typeof contents] || { downloadUrl: '#', description: 'PDF download and extension translation available.' }
  }



  const translations = {
    en: { title: 'संस्कृति', subtitle: 'Multilingual Cultural Translation Platform', offlineTranslator: 'Text Translator', learningModules: 'Learning Modules', literatureCentre: 'Literature Centre' },
    ne: { title: 'संस्कृति', subtitle: 'बहुभाषिक सांस्कृतिक अनुवाद प्लेटफर्म', offlineTranslator: 'पाठ अनुवादक', learningModules: 'सिकाइ मोड्युलहरू', literatureCentre: 'साहित्य केन्द्र' },
    si: { title: 'සංස්කෘතිය', subtitle: 'බහුභාෂික සංස්කෘතික පරිවර්තන වේදිකාව', offlineTranslator: 'පෙළ පරිවර්තකය', learningModules: 'ඉගෙනුම් මොඩියුල', literatureCentre: 'සාහිත්‍ය මධ්‍යස්ථානය' }
  }

  const t = translations[language as keyof typeof translations]

  const manuscripts = [
    { title: 'मुना मदन', subtitle: 'Nepali Classic', type: 'Cultural Context', icon: '🎭', description: 'Laxmi Prasad Devkota\'s masterpiece with cultural annotations' },
    { title: 'शिरीषको फूल', subtitle: 'Nepali Literature', type: 'Essay Collection • Analysis', icon: '🌸', description: 'Bishnu Kumari Waiba\'s essays on life and society' },
    { title: 'කුමරිහිමි', subtitle: 'Sinhala Legend', type: 'Interactive Story • Pronunciation', icon: '👸', description: 'Classical Sinhala tale with pronunciation guides' },
    { title: 'සිරි සංගරාව', subtitle: 'Sinhala Poetry', type: 'Verse Analysis', icon: '📜', description: 'Ancient Sinhala poetry with meter and meaning explanations' },
    { title: 'गिरिश कर्णको गीत', subtitle: 'Modern Nepali', type: 'Song Lyrics', icon: '🎵', description: 'Contemporary Nepali songs with cultural significance' },
    { title: 'සකුන්තලා', subtitle: 'Classical Drama', type: 'Play Script • Performance', icon: '🎪', description: 'Kalidasa\'s drama adapted in Sinhala with performance notes' },
    { title: 'रामायण', subtitle: 'Sanskrit Epic', type: 'Word Translation', icon: '📖', description: 'Complete Ramayana with verse-by-verse translation and cultural commentary' },
    { title: 'महाभारत', subtitle: 'Ancient Wisdom', type: 'Interactive Reading • Notes', icon: '⚔️', description: 'Epic tales with character guides and philosophical insights' },
    { title: 'भगवद्गीता', subtitle: 'Spiritual Guide', type: 'Parallel Text', icon: '🕉️', description: 'Sacred text with multiple translations and spiritual commentary' }
  ]

  return (
    <div className={`cultural-app ${theme} ${uiTheme}`} suppressHydrationWarning>
      <header className="cultural-header">
        <div className="header-ornament"></div>
        <div className="header-content">
          <div className="header-left">
            <h1 className="main-title">{t.title}</h1>
            <p className="subtitle">{t.subtitle}</p>
          </div>
          <div className="header-right">
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="cultural-select">
              <option value="en">English</option>
              <option value="ne">नेपाली</option>
              <option value="si">සිංහල</option>
            </select>
            <button className="theme-btn" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button className="culture-btn" onClick={() => setUiTheme(uiTheme === 'nepali-theme' ? 'srilankan-theme' : 'nepali-theme')}>
              {uiTheme === 'nepali-theme' ? '🏔️' : '🌴'}
            </button>
          </div>
        </div>
        <div className="header-ornament bottom"></div>
      </header>

      <aside className="cultural-sidebar">
        <nav className="sidebar-nav">
          <Link href="/text-translator" className={`sidebar-item ${pathname === '/text-translator' ? 'active' : ''}`}>
            <span className="sidebar-icon">🔄</span>
            <span className="sidebar-text">{t.offlineTranslator}</span>
          </Link>
          <Link href="/image-upload" className={`sidebar-item ${pathname === '/image-upload' ? 'active' : ''}`}>
            <span className="sidebar-icon">📷</span>
            <span className="sidebar-text">{language === 'ne' ? 'छवि/PDF अपलोड' : language === 'si' ? 'රූප/PDF උඩුගත කිරීම' : 'Image/PDF Upload'}</span>
          </Link>
          <Link href="/learning-modules" className={`sidebar-item ${pathname === '/learning-modules' ? 'active' : ''}`}>
            <span className="sidebar-icon">📚</span>
            <span className="sidebar-text">{t.learningModules}</span>
          </Link>
          <Link href="/literature-centre" className={`sidebar-item ${pathname === '/literature-centre' ? 'active' : ''}`}>
            <span className="sidebar-icon">📜</span>
            <span className="sidebar-text">{t.literatureCentre}</span>
          </Link>
          <Link href="/download-extension" className={`sidebar-item ${pathname === '/download-extension' ? 'active' : ''}`}>
            <span className="sidebar-icon">⬇️</span>
            <span className="sidebar-text">{language === 'ne' ? 'एक्सटेन्सन डाउनलोड' : language === 'si' ? 'දිගුව බාගත කරන්න' : 'Download Extension'}</span>
          </Link>
        </nav>
      </aside>

      <main className="cultural-main with-sidebar">
        <div className="content-container">
          <div className="heritage-library">
            <div className="library-header">
              <h2 className="library-title">{t.literatureCentre.toUpperCase()}</h2>
              <div className="offline-badge">
                <span>📚</span> {language === 'ne' ? 'ई-पुस्तकहरू • अनुवाद समर्थन' : language === 'si' ? 'ඊ-පොත් • පරිවර්තන සහාය' : 'E-books • Translation Support'}
              </div>
              <div className="library-ornament">📜</div>
            </div>

            {!showEbook ? (
              <div className="manuscript-collection">
                {manuscripts.map((manuscript, index) => (
                  <div key={index} className="manuscript-scroll" onClick={() => handleManuscriptClick(manuscript)}>
                    <div className="scroll-decoration"></div>
                    <div className="manuscript-content">
                      <h3 className="manuscript-title">{manuscript.title}</h3>
                      <p className="manuscript-culture">{manuscript.subtitle}</p>
                      <div className="manuscript-features">{manuscript.type}</div>
                      <p className="manuscript-description">{manuscript.description}</p>
                    </div>
                    <div className="scroll-seal">{manuscript.icon}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="ebook-reader">
                <div className="ebook-header">
                  <button onClick={() => setShowEbook(false)} className="back-btn">← Back to Library</button>
                  <h2>{selectedManuscript?.title}</h2>
                </div>

                {selectedManuscript?.title === 'मुना मदन' && (
                  <div className="preview-section">
                    <h3>📖 Preview - Opening Lines</h3>
                    <div className="nepali-text">
                      <p>&quot;मान्छे त्यो हो जो मान्छेका लागि मर्छ&quot;</p>
                      <p>&quot;Man is one who dies for mankind&quot;</p>
                    </div>
                    <div className="story-excerpt">
                      <h4>Story Summary:</h4>
                      <p>Muna Madan is the tragic tale of a young man named Madan who leaves his beloved wife Muna to travel to Lhasa for trade. The epic explores themes of love, sacrifice, and the harsh realities of life in early 20th century Nepal.</p>
                    </div>
                  </div>
                )}

                {selectedManuscript?.title === 'रामायण' && (
                  <div className="preview-section">
                    <h3>📖 Preview - Bala Kanda Opening</h3>
                    <div className="nepali-text">
                      <p>&quot;तपःस्वाध्यायशीलं तपस्वी वाग्विदां वरम्&quot;</p>
                      <p>&quot;Devoted to austerity and study, the best among those who know speech&quot;</p>
                    </div>
                    <div className="story-excerpt">
                      <h4>Epic Summary:</h4>
                      <p>The Ramayana is the ancient Sanskrit epic of Prince Rama&apos;s journey, his exile, Sita&apos;s abduction by Ravana, and the great war in Lanka. This version contains both Sanskrit verses and Hindi translation by Pandit D.P. Sharma.</p>
                    </div>
                  </div>
                )}

                {selectedManuscript?.title === 'महाभारत' && (
                  <div className="preview-section">
                    <h3>📖 Preview - Adi Parva Opening</h3>
                    <div className="nepali-text">
                      <p>&quot;नारायणं नमस्कृत्य नरं चैव नरोत्तमम्&quot;</p>
                      <p>&quot;Having bowed to Narayana, and to Nara, the best of men&quot;</p>
                    </div>
                    <div className="story-excerpt">
                      <h4>Epic Summary:</h4>
                      <p>The Mahabharata is the world&apos;s longest epic poem, chronicling the great war between the Pandavas and Kauravas. This Gita Press edition contains the complete Sanskrit text with Hindi translation across multiple volumes.</p>
                    </div>
                  </div>
                )}

                {selectedManuscript?.title === 'भगवद्गीता' && (
                  <div className="preview-section">
                    <h3>📖 Preview - Chapter 2, Verse 47</h3>
                    <div className="nepali-text">
                      <p>&quot;कर्मण्येवाधिकारस्ते मा फलेषु कदाचन&quot;</p>
                      <p>&quot;You have the right to perform action, but never to the fruits of action&quot;</p>
                    </div>
                    <div className="story-excerpt">
                      <h4>Sacred Text Summary:</h4>
                      <p>The Bhagavad Gita is Krishna&apos;s divine discourse to Arjuna on the battlefield of Kurukshetra. This Sanskrit Academy edition contains the original 700 verses with authentic Sanskrit text and scholarly commentary.</p>
                    </div>
                  </div>
                )}

                {selectedManuscript?.title === 'शिरीषको फूल' && (
                  <div className="preview-section">
                    <h3>📖 Preview - Essay Collection</h3>
                    <div className="nepali-text">
                      <p>&quot;जीवनमा कति रङ्गहरू छन्, कति माया छ&quot;</p>
                      <p>&quot;How many colors are there in life, how much love there is&quot;</p>
                    </div>
                    <div className="story-excerpt">
                      <h4>Essay Collection Summary:</h4>
                      <p>Shirish ko Phool is a collection of beautiful essays by Bishnu Kumari Waiba that reflect on life, nature, and human emotions. The essays capture the essence of Nepali literary tradition with poetic prose and deep philosophical insights.</p>
                    </div>
                  </div>
                )}

                {selectedManuscript?.title === 'සිරි සංගරාව' && (
                  <div className="preview-section">
                    <h3>📖 Preview - Classical Sinhala Poetry</h3>
                    <div className="nepali-text">
                      <p>&quot;සිරි සංගරාව සුන්දර කාව්ය&quot;</p>
                      <p>&quot;Beautiful Siri Sangarawa poetry&quot;</p>
                    </div>
                    <div className="story-excerpt">
                      <h4>Poetry Collection Summary:</h4>
                      <p>Siri Sangarawa is a collection of classical Sinhala poetry that showcases the rich literary heritage of Sri Lanka. These traditional verses explore themes of love, nature, spirituality, and cultural values with beautiful Sinhala meter and rhythm.</p>
                    </div>
                  </div>
                )}

                {selectedManuscript?.title === 'गिरिश कर्णको गीत' && (
                  <div className="preview-section">
                    <h3>📖 Preview - Nepali Folk Songs</h3>
                    <div className="nepali-text">
                      <p>&quot;बियाह सँ द्विरागमन धरिक गीत&quot;</p>
                      <p>&quot;Wedding and ceremonial folk songs&quot;</p>
                    </div>
                    <div className="story-excerpt">
                      <h4>Folk Song Collection Summary:</h4>
                      <p>This collection features traditional Nepali folk songs including wedding ceremonies, cultural celebrations, and Maithili regional songs. These lyrics preserve the rich musical heritage of Nepal with authentic cultural expressions and traditional melodies.</p>
                    </div>
                  </div>
                )}

                {selectedManuscript?.title === 'කුමරිහිමි' && (
                  <div className="preview-section">
                    <h3>📖 Preview - Sinhala Legend</h3>
                    <div className="nepali-text">
                      <p>&quot;පදිනි චරිත්ර චොපාය&quot;</p>
                      <p>&quot;Padhini Charitra - Historical Tales&quot;</p>
                    </div>
                    <div className="story-excerpt">
                      <h4>Legend Collection Summary:</h4>
                      <p>Kumarihimi represents classical Sinhala legends and historical tales that preserve the rich cultural heritage of Sri Lanka. These stories feature ancient wisdom, royal chronicles, and traditional narratives passed down through generations.</p>
                    </div>
                  </div>
                )}

                {selectedManuscript?.title === 'සකුන්තලා' && (
                  <div className="preview-section">
                    <h3>📖 Preview - Classical Drama</h3>
                    <div className="nepali-text">
                      <p>&quot;සකුන්තලා - කාලිදාසගේ නාට්යය&quot;</p>
                      <p>&quot;Sakuntala - Kalidasa&apos;s Drama&quot;</p>
                    </div>
                    <div className="story-excerpt">
                      <h4>Classical Drama Summary:</h4>
                      <p>Sakuntala is the timeless Sanskrit drama by Kalidasa, beautifully adapted into Sinhala. This classical play tells the story of King Dushyanta and Sakuntala, exploring themes of love, memory, and divine intervention with poetic dialogue and dramatic scenes.</p>
                    </div>
                  </div>
                )}

                <div className="download-section">
                  <div className="download-card">
                    <h3>💾 Download E-book</h3>
                    <p>{getEbookContent(selectedManuscript).description}</p>
                    <a href={getEbookContent(selectedManuscript).downloadUrl} target="_blank" rel="noopener noreferrer" className="download-btn">
                      📎 Download PDF
                    </a>
                  </div>
                  <div className="extension-card">
                    <h3>🔌 Browser Extension</h3>
                    <p>Install our translation extension to:</p>
                    <ul>
                      <li>• Translate any text instantly</li>
                      <li>• Works with downloaded PDFs</li>
                      <li>• Cultural context included</li>
                    </ul>
                    <Link href="/download-extension" className="extension-btn">
                      ⬇️ Get Extension
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <style jsx>{`
        .preview-section {
          background: linear-gradient(135deg, #fff8dc 0%, #f5deb3 100%);
          padding: 25px;
          border-radius: 15px;
          margin-bottom: 25px;
          border: 2px solid #daa520;
        }
        .nepali-text {
          background: white;
          padding: 20px;
          border-radius: 10px;
          margin: 15px 0;
          border-left: 4px solid #8b4513;
        }
        .nepali-text p:first-child {
          font-size: 1.3rem;
          color: #8b4513;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .nepali-text p:last-child {
          font-style: italic;
          color: #666;
          margin: 0;
        }
        .story-excerpt {
          background: rgba(255,255,255,0.7);
          padding: 15px;
          border-radius: 8px;
        }
        .story-excerpt h4 {
          color: #8b4513;
          margin-bottom: 10px;
        }
        .ebook-reader {
          max-width: 800px;
          margin: 0 auto;
        }
        .ebook-header {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 2px solid #daa520;
        }
        .back-btn {
          background: #8b4513;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 1rem;
        }
        .download-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 25px;
          margin-top: 25px;
        }
        .download-card, .extension-card {
          background: white;
          padding: 25px;
          border-radius: 15px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .download-btn, .extension-btn {
          display: inline-block;
          background: #228b22;
          color: white;
          text-decoration: none;
          padding: 12px 25px;
          border-radius: 20px;
          margin-top: 15px;
          font-weight: bold;
        }
        .extension-card ul {
          margin: 15px 0;
          padding-left: 0;
        }
        .extension-card li {
          list-style: none;
          margin: 8px 0;
          color: #666;
        }
      `}</style>

      <footer className="cultural-footer">
        <div className="footer-pattern"></div>
        <div className="footer-content">
          <p>🕉️ संस्कृति - Multilingual Translation & Cultural Bridge 🕉️</p>
          <p>Privacy-Safe • Cultural Heritage Preserved</p>
        </div>
        <div className="footer-pattern bottom"></div>
      </footer>
    </div>
  )
}