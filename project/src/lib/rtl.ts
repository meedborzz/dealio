export const isRTL = (lang: string): boolean => {
  const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
  return rtlLanguages.includes(lang);
};

export const setDocumentDirection = (lang: string) => {
  const direction = isRTL(lang) ? 'rtl' : 'ltr';
  document.documentElement.dir = direction;
  document.documentElement.lang = lang;
};

export const getTextAlign = (lang: string): 'left' | 'right' => {
  return isRTL(lang) ? 'right' : 'left';
};
