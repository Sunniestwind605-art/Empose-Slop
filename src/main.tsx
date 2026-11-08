import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/allura';
import '@fontsource-variable/cormorant-garamond/wght.css';
import '@fontsource-variable/space-grotesk/wght.css';
import '@fontsource-variable/syne/wght.css';
import App from './App';
import './styles/global.css';

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL })
      .catch((error) => console.warn('Offline support could not be enabled.', error));
  });
}

