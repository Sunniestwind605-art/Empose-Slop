import { createContext, useContext, useMemo } from 'react';
import { STORAGE_KEYS } from './config';
import { defaultAnswers } from './data/options';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { QuestionnaireAnswers } from './types';

type AppContextValue = {
  favourites: string[];
  toggleFavourite: (id: string) => void;
  session: string[];
  addToSession: (id: string) => void;
  removeFromSession: (id: string) => void;
  moveSessionItem: (id: string, direction: -1 | 1) => void;
  clearSession: () => void;
  answers: QuestionnaireAnswers;
  setAnswers: React.Dispatch<React.SetStateAction<QuestionnaireAnswers>>;
  clearLocalData: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [favourites, setFavourites] = useLocalStorage<string[]>(STORAGE_KEYS.favourites, []);
  const [session, setSession] = useLocalStorage<string[]>(STORAGE_KEYS.session, []);
  const [answers, setAnswers] = useLocalStorage<QuestionnaireAnswers>(STORAGE_KEYS.answers, defaultAnswers);

  const value = useMemo<AppContextValue>(() => ({
    favourites,
    toggleFavourite: (id) => setFavourites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]),
    session,
    addToSession: (id) => setSession((current) => current.includes(id) ? current : [...current, id]),
    removeFromSession: (id) => setSession((current) => current.filter((item) => item !== id)),
    moveSessionItem: (id, direction) => setSession((current) => {
      const from = current.indexOf(id);
      const to = from + direction;
      if (from < 0 || to < 0 || to >= current.length) return current;
      const next = [...current];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    }),
    clearSession: () => setSession([]),
    answers,
    setAnswers,
    clearLocalData: () => {
      Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
      setFavourites([]);
      setSession([]);
      setAnswers(defaultAnswers);
    },
  }), [answers, favourites, session, setAnswers, setFavourites, setSession]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}

