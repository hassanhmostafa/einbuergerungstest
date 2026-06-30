import { createContext, useContext, useState, type ReactNode } from "react";

interface TranslationContextValue {
  showTranslation: boolean;
  toggleTranslation: () => void;
}

const TranslationContext = createContext<TranslationContextValue>({
  showTranslation: true,
  toggleTranslation: () => {},
});

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [showTranslation, setShowTranslation] = useState(true);
  const toggleTranslation = () => setShowTranslation((v) => !v);
  return (
    <TranslationContext.Provider value={{ showTranslation, toggleTranslation }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  return useContext(TranslationContext);
}
