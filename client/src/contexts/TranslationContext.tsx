import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface TranslationContextValue {
  showTranslation: boolean;
  toggleTranslation: () => void;
}

const TranslationContext = createContext<TranslationContextValue>({
  showTranslation: true,
  toggleTranslation: () => {},
});

/**
 * Find the question card element that is currently closest to the top of the
 * visible viewport (but still at least partially visible). We use this as the
 * scroll anchor so that toggling translations doesn't jump to a different card.
 */
function findAnchorCard(): { el: HTMLElement; offsetFromTop: number } | null {
  // Question cards have id="q-0", "q-1", … in the Home page.
  // In the Exam page there is only one card at a time so no anchoring needed.
  const cards = Array.from(
    document.querySelectorAll<HTMLElement>(".question-card")
  );
  if (cards.length === 0) return null;

  const viewportTop = window.scrollY;

  // Pick the card whose top edge is closest to (but not below) the viewport top.
  let best: HTMLElement | null = null;
  let bestDist = Infinity;

  for (const card of cards) {
    const rect = card.getBoundingClientRect();
    const absTop = rect.top + window.scrollY;
    // Only consider cards that are at least partially visible
    if (rect.bottom < 0) continue; // fully above viewport
    const dist = Math.abs(rect.top); // distance of card top from viewport top
    if (dist < bestDist) {
      bestDist = dist;
      best = card;
    }
  }

  if (!best) return null;
  const rect = best.getBoundingClientRect();
  // How far the card's top edge is from the current viewport top (can be negative)
  return { el: best, offsetFromTop: rect.top };
}

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [showTranslation, setShowTranslation] = useState(true);

  const toggleTranslation = useCallback(() => {
    // 1. Capture anchor BEFORE state change
    const anchor = findAnchorCard();

    // 2. Apply state change (causes re-render + layout shift)
    setShowTranslation((v) => !v);

    // 3. After the browser has painted the new layout, restore scroll position
    //    so the anchored card stays at the same visual offset from the top.
    if (anchor) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const newRect = anchor.el.getBoundingClientRect();
          const newAbsTop = newRect.top + window.scrollY;
          const desiredScrollY = newAbsTop - anchor.offsetFromTop;
          window.scrollTo({ top: desiredScrollY, behavior: "instant" });
        });
      });
    }
  }, []);

  return (
    <TranslationContext.Provider value={{ showTranslation, toggleTranslation }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  return useContext(TranslationContext);
}
