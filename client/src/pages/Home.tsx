/**
 * EINBÜRGERUNGSTEST — Dark Study Mode
 * Design: Precision Dark UI · IBM Plex Sans · German Gold accent
 * Layout: Single-column centered, sticky header, 2×2 answer grid
 * Interaction: Click any answer → instant green/correct + red/wrong reveal
 */

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { generalQuestions, nrwQuestions, type Question } from "@/data/questions";

// ── Types ────────────────────────────────────────────────────────────────────
type Section = "general" | "nrw";
type RevealState = Record<number, boolean>; // questionIndex → revealed

// ── Constants ────────────────────────────────────────────────────────────────
const LETTER = ["A", "B", "C", "D"];

// ── Sub-components ───────────────────────────────────────────────────────────

function FlagStripe() {
  return (
    <div
      className="flag-stripe w-full"
      aria-hidden="true"
    />
  );
}

function Header({
  section,
  onSectionChange,
  answeredCount,
  totalCount,
  correctCount,
  onReset,
}: {
  section: Section;
  onSectionChange: (s: Section) => void;
  answeredCount: number;
  totalCount: number;
  correctCount: number;
  onReset: () => void;
}) {
  const pct = totalCount > 0 ? (answeredCount / totalCount) * 100 : 0;

  return (
    <header className="sticky top-0 z-50" style={{ background: "oklch(0.14 0.025 260 / 0.97)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--border)" }}>
      <div className="container">
        {/* Top row */}
        <div className="flex items-center justify-between py-3 gap-4">
          {/* Logo + title */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="flex-shrink-0 w-8 h-8 rounded flex items-center justify-center font-bold text-sm"
              style={{ background: "oklch(0.87 0.18 90)", color: "oklch(0.12 0.02 260)", fontFamily: "'IBM Plex Mono', monospace" }}
            >
              DE
            </div>
            <div className="min-w-0">
              <div className="font-bold text-sm leading-tight truncate" style={{ color: "var(--foreground)" }}>
                Einbürgerungstest
              </div>
              <div className="text-xs truncate" style={{ color: "var(--muted-foreground)" }}>
                German Citizenship Test
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {answeredCount > 0 && (
              <div className="text-xs hidden sm:flex items-center gap-2" style={{ color: "var(--muted-foreground)" }}>
                <span style={{ color: "oklch(0.80 0.15 145)" }}>✓ {correctCount}</span>
                <span>/</span>
                <span style={{ color: "oklch(0.78 0.15 25)" }}>✗ {answeredCount - correctCount}</span>
              </div>
            )}
            <button
              onClick={onReset}
              className="text-xs px-3 py-1.5 rounded transition-all"
              style={{
                background: "var(--secondary)",
                color: "var(--muted-foreground)",
                border: "1px solid var(--border)",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--foreground)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--muted-foreground)")}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Section tabs */}
        <div className="flex gap-1 pb-3">
          {(["general", "nrw"] as Section[]).map((s) => (
            <button
              key={s}
              onClick={() => onSectionChange(s)}
              className="px-4 py-1.5 rounded text-sm font-medium transition-all"
              style={
                section === s
                  ? {
                      background: "oklch(0.87 0.18 90)",
                      color: "oklch(0.12 0.02 260)",
                    }
                  : {
                      background: "transparent",
                      color: "var(--muted-foreground)",
                      border: "1px solid var(--border)",
                    }
              }
            >
              {s === "general" ? "General (300)" : "NRW State (10)"}
            </button>
          ))}
        </div>

        {/* Progress bar */}
        <div className="pb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs" style={{ color: "var(--muted-foreground)", fontFamily: "'IBM Plex Mono', monospace" }}>
              {answeredCount} / {totalCount} answered
            </span>
            <span className="text-xs" style={{ color: "var(--muted-foreground)", fontFamily: "'IBM Plex Mono', monospace" }}>
              {Math.round(pct)}%
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                background: pct === 100
                  ? "oklch(0.55 0.18 145)"
                  : "oklch(0.87 0.18 90)",
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

function AnswerOption({
  letter,
  text,
  textEn,
  isCorrect,
  revealed,
  onClick,
}: {
  letter: string;
  text: string;
  textEn: string;
  isCorrect: boolean;
  revealed: boolean;
  onClick: () => void;
}) {
  const stateClass = revealed
    ? isCorrect
      ? "correct revealed"
      : "wrong revealed"
    : "";

  return (
    <button
      className={`answer-option ${stateClass}`}
      onClick={!revealed ? onClick : undefined}
      disabled={revealed}
    >
      <div className="flex items-start gap-3">
        {/* Letter badge */}
        <span
          className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-xs font-bold mt-0.5"
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            background: revealed
              ? isCorrect
                ? "oklch(0.55 0.18 145 / 0.3)"
                : "oklch(0.55 0.22 25 / 0.3)"
              : "var(--border)",
            color: revealed
              ? isCorrect
                ? "var(--correct-text)"
                : "var(--wrong-text)"
              : "var(--muted-foreground)",
          }}
        >
          {revealed ? (isCorrect ? "✓" : "✗") : letter}
        </span>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium leading-snug">{text}</div>
          <div
            className="text-xs italic mt-0.5 leading-snug"
            style={{
              color: revealed
                ? isCorrect
                  ? "oklch(0.65 0.12 145)"
                  : "oklch(0.60 0.12 25)"
                : "var(--muted-foreground)",
            }}
          >
            {textEn}
          </div>
        </div>
      </div>
    </button>
  );
}

function QuestionCard({
  question,
  index,
  globalIndex,
  revealed,
  onReveal,
  onCorrect,
}: {
  question: Question;
  index: number;
  globalIndex: number;
  revealed: boolean;
  onReveal: (idx: number, isCorrect: boolean) => void;
  onCorrect: boolean | null;
}) {
  const handleClick = useCallback(
    (answerText: string) => {
      if (revealed) return;
      const isCorrect = answerText === question.correct_answer;
      onReveal(index, isCorrect);
    },
    [revealed, question.correct_answer, onReveal, index]
  );

  const isNrw = question.section === "nrw";

  return (
    <div className="question-card" id={`q-${index}`}>
      {/* Question header */}
      <div className="flex items-start gap-3 mb-4">
        {/* Number badge */}
        <div
          className="flex-shrink-0 flex flex-col items-center justify-center rounded px-2 py-1 min-w-[3rem]"
          style={{
            background: isNrw ? "oklch(0.22 0.06 145)" : "oklch(0.20 0.04 260)",
            border: `1px solid ${isNrw ? "oklch(0.40 0.12 145)" : "oklch(0.87 0.18 90 / 0.4)"}`,
          }}
        >
          <span
            className="text-xs font-medium leading-none"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              color: isNrw ? "oklch(0.65 0.15 145)" : "oklch(0.87 0.18 90)",
            }}
          >
            {isNrw ? "NRW" : "Q"}
          </span>
          <span
            className="text-lg font-bold leading-tight"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              color: isNrw ? "oklch(0.80 0.15 145)" : "oklch(0.87 0.18 90)",
            }}
          >
            {question.number}
          </span>
        </div>

        {/* Question text */}
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold leading-snug" style={{ color: "var(--foreground)" }}>
            {question.question}
          </p>
          <p className="text-sm italic mt-1 leading-snug" style={{ color: "var(--muted-foreground)" }}>
            {question.question_en}
          </p>
        </div>
      </div>

      {/* Answer options — 2-col on sm+, 1-col on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {question.all_answers.map((ans, i) => (
          <AnswerOption
            key={i}
            letter={LETTER[i]}
            text={ans}
            textEn={question.all_answers_en?.[i] ?? ans}
            isCorrect={ans === question.correct_answer}
            revealed={revealed}
            onClick={() => handleClick(ans)}
          />
        ))}
      </div>

      {/* Result indicator after reveal */}
      {revealed && (
        <div
          className="mt-3 text-xs font-medium flex items-center gap-1.5 transition-all"
          style={{
            color: onCorrect ? "oklch(0.80 0.15 145)" : "oklch(0.78 0.15 25)",
          }}
        >
          {onCorrect ? "✓ Correct!" : "✗ Wrong — the correct answer is highlighted above."}
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function Home() {
  const [section, setSection] = useState<Section>("general");
  const [revealed, setRevealed] = useState<RevealState>({});
  const [correctMap, setCorrectMap] = useState<Record<number, boolean>>({});

  const questions = useMemo(
    () => (section === "general" ? generalQuestions : nrwQuestions),
    [section]
  );

  const answeredCount = useMemo(
    () => Object.keys(revealed).length,
    [revealed]
  );

  const correctCount = useMemo(
    () => Object.values(correctMap).filter(Boolean).length,
    [correctMap]
  );

  const handleReveal = useCallback((idx: number, isCorrect: boolean) => {
    setRevealed((prev) => ({ ...prev, [idx]: true }));
    setCorrectMap((prev) => ({ ...prev, [idx]: isCorrect }));
  }, []);

  const handleReset = useCallback(() => {
    setRevealed({});
    setCorrectMap({});
  }, []);

  const handleSectionChange = useCallback((s: Section) => {
    setSection(s);
    setRevealed({});
    setCorrectMap({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <FlagStripe />

      <Header
        section={section}
        onSectionChange={handleSectionChange}
        answeredCount={answeredCount}
        totalCount={questions.length}
        correctCount={correctCount}
        onReset={handleReset}
      />

      {/* Hero intro — only shown when 0 questions answered */}
      {answeredCount === 0 && (
        <div className="container pt-8 pb-4">
          <div
            className="rounded-lg p-5 mb-2"
            style={{
              background: "oklch(0.16 0.03 260)",
              border: "1px solid oklch(0.87 0.18 90 / 0.25)",
            }}
          >
            <h1 className="text-xl font-bold mb-1" style={{ color: "oklch(0.87 0.18 90)" }}>
              310 Questions. One Goal.
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
              Click <em>any</em> answer to instantly reveal which option is correct (
              <span style={{ color: "oklch(0.80 0.15 145)" }}>green</span>) and which are wrong (
              <span style={{ color: "oklch(0.78 0.15 25)" }}>red</span>). All four options reveal at once — just like the real exam.
            </p>
            <p className="text-xs mt-2" style={{ color: "oklch(0.50 0.015 240)" }}>
              Source: Official BAMF Gesamtfragenkatalog · Stand 07.05.2025
            </p>
          </div>
        </div>
      )}

      {/* Question list */}
      <main className="container py-4 pb-16">
        {questions.map((q, i) => (
          <QuestionCard
            key={`${section}-${q.number}`}
            question={q}
            index={i}
            globalIndex={i}
            revealed={!!revealed[i]}
            onReveal={handleReveal}
            onCorrect={correctMap[i] ?? null}
          />
        ))}

        {/* Footer note */}
        <div className="mt-8 text-center text-xs" style={{ color: "oklch(0.40 0.015 240)" }}>
          <p>Einbürgerungstest · Leben in Deutschland</p>
          <p className="mt-1">Questions sourced from lebenindeutschland.eu and the official BAMF catalog.</p>
        </div>
      </main>
    </div>
  );
}
