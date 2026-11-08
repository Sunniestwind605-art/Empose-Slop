import { useEffect } from 'react';

export function useCollectionTheme(collection?: string) {
  useEffect(() => {
    const themes = {
      'romantic-mode': collection === 'romantic',
      'masculine-mode': collection === 'masculine',
    };

    Object.entries(themes).forEach(([className, active]) => document.body.classList.toggle(className, active));

    return () => Object.keys(themes).forEach((className) => document.body.classList.remove(className));
  }, [collection]);
}
