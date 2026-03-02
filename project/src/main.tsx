import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { getPreferences } from './lib/preferences';
import { initNativeAppBehaviors } from './lib/nativeApp';

if (import.meta.env.PROD) {
  import('./registerSW');
}

initNativeAppBehaviors();

const preferences = getPreferences();

if (preferences.theme === 'dark') {
  document.documentElement.classList.add('dark');
} else if (preferences.theme === 'system') {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (prefersDark) {
    document.documentElement.classList.add('dark');
  }
}

document.documentElement.lang = preferences.language;
document.documentElement.dir = preferences.language === 'ar' ? 'rtl' : 'ltr';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);