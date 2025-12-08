'use client';
import { useLanguage } from '../contexts/LanguageContext';

export default function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="language-selector">
      <select 
        value={language} 
        onChange={(e) => setLanguage(e.target.value as 'en' | 'si' | 'ne')}
        className="px-3 py-1 border rounded-md bg-white"
      >
        <option value="en">{t('common.english')}</option>
        <option value="si">{t('common.sinhala')}</option>
        <option value="ne">{t('common.nepali')}</option>
      </select>
    </div>
  );
}