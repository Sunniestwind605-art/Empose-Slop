import { useEffect } from 'react';

export function useCollectionTheme(collection?: string) {
  useEffect(() => {
    const romantic = collection === 'romantic';
    document.body.classList.toggle('romantic-mode', romantic);

    return () => document.body.classList.remove('romantic-mode');
  }, [collection]);
}
