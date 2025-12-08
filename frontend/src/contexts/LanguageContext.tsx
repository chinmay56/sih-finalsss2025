'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'si' | 'ne';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    'nav.home': 'Home',
    'nav.translate': 'Translate',
    'nav.learning': 'Learning Modules',
    'nav.ocr': 'Image/PDF Upload',
    'nav.literature': 'Literature Centre',
    'nav.extension': 'Get Extension',
    'translate.title': 'Translation Tool',
    'translate.from': 'From',
    'translate.to': 'To',
    'translate.placeholder': 'Enter text to translate...',
    'translate.button': 'Translate',
    'learning.title': 'Learning Modules',
    'learning.alphabets': 'Alphabets & Scripts',
    'learning.vocabulary': 'Vocabulary Builder',
    'learning.grammar': 'Grammar Rules',
    'learning.stories': 'Stories & Poems',
    'common.language': 'Language',
    'common.english': 'English',
    'common.sinhala': 'Sinhala',
    'common.nepali': 'Nepali',
  },
  si: {
    'nav.home': 'මුල් පිටුව',
    'nav.translate': 'පරිවර්තනය',
    'nav.learning': 'ඉගෙනුම් මොඩියුල',
    'nav.ocr': 'චායාරුප/PDF අප්ලෝඩ්',
    'nav.literature': 'සාහිත්ය කෙන්ද්රය',
    'nav.extension': 'එක්ස්ටෙන්ශන් ලබා ගන්න',
    'translate.title': 'පරිවර්තන මෙවලම',
    'translate.from': 'සිට',
    'translate.to': 'දක්වා',
    'translate.placeholder': 'පරිවර්තනය කිරීමට පෙළ ඇතුළත් කරන්න...',
    'translate.button': 'පරිවර්තනය කරන්න',
    'learning.title': 'ඉගෙනුම් මොඩියුල',
    'learning.alphabets': 'අකුරු සහ ලිපි',
    'learning.vocabulary': 'වචන සම්භාරය',
    'learning.grammar': 'ව්‍යාකරණ නීති',
    'learning.stories': 'කතා සහ කවි',
    'common.language': 'භාෂාව',
    'common.english': 'ඉංග්‍රීසි',
    'common.sinhala': 'සිංහල',
    'common.nepali': 'නේපාල',
  },
  ne: {
    'nav.home': 'गृहपृष्ठ',
    'nav.translate': 'अनुवाद',
    'nav.learning': 'सिकाइ मोड्युल',
    'nav.ocr': 'छवि/PDF अपलोड',
    'nav.literature': 'साहित्य केन्द्र',
    'nav.extension': 'एक्सटेन्सन प्राप्त गर्नुहोस्',
    'translate.title': 'अनुवाद उपकरण',
    'translate.from': 'बाट',
    'translate.to': 'मा',
    'translate.placeholder': 'अनुवाद गर्न पाठ प्रविष्ट गर्नुहोस्...',
    'translate.button': 'अनुवाद गर्नुहोस्',
    'learning.title': 'सिकाइ मोड्युल',
    'learning.alphabets': 'वर्णमाला र लिपि',
    'learning.vocabulary': 'शब्दकोश निर्माता',
    'learning.grammar': 'व्याकरण नियम',
    'learning.stories': 'कथा र कविता',
    'common.language': 'भाषा',
    'common.english': 'अंग्रेजी',
    'common.sinhala': 'सिंहली',
    'common.nepali': 'नेपाली',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('language') as Language;
    if (saved && ['en', 'si', 'ne'].includes(saved)) {
      setLanguage(saved);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return (translations[language] as any)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}