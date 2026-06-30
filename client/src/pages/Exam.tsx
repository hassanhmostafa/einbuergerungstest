/**
 * EINBÜRGERUNGSTEST — Exam Mode
 * 30 random general questions + 3 random NRW questions = 33 total
 * Sequential: one question at a time, click to reveal, then Next
 * Final screen: score summary with pass/fail (≥17 correct = pass)
 */

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { generalQuestions, nrwQuestions, type Question } from "@/data/questions";
import { useTranslation } from "@/contexts/TranslationContext";

const LETTER = ["A", "B", "C", "D"];
const TOTAL_QUESTIONS = 33;
const GENERAL_COUNT = 30;
const NRW_COUNT = 3;
const PASS_THRESHOLD = 17; // official passing score
const EXAM_MINUTES = 60;

// ── Helpers ───────────────────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateExam(): Question[] {
  const general = shuffle(generalQuestions).slice(0, GENERAL_COUNT);
  const nrw = shuffle(nrwQuestions).slice(0, NRW_COUNT);
  return shuffle([...general, ...nrw]);
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// ── Flag stripe ───────────────────────────────────────────────────────────────
function FlagStripe() {
  return <div className="flag-stripe w-full" aria-hidden="true" />;
}

// ── Translation toggle ────────────────────────────────────────────────────────
function TranslationToggle() {
  const { showTranslation, toggleTranslation } = useTranslation();
  return (
    <button
      onClick={toggleTranslation}
      title={showTranslation ? "Hide English translations" : "Show English translations"}
      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded transition-all"
      style={{
        background: showTranslation ? "oklch(0.87 0.18 90 / 0.15)" : "var(--secondary)",
        color: showTranslation ? "oklch(0.87 0.18 90)" : "var(--muted-foreground)",
        border: `1px solid ${showTranslation ? "oklch(0.87 0.18 90 / 0.4)" : "var(--border)"}`,
      }}
    >
      <span>EN</span>
      <span style={{ opacity: showTranslation ? 1 : 0.4 }}>{showTranslation ? "ON" : "OFF"}</span>
    </button>
  );
}

// ── Exam header ───────────────────────────────────────────────────────────────
function ExamHeader({
  current,
  total,
  timeLeft,
  onExit,
}: {
  current: number;
  total: number;
  timeLeft: number;
  onExit: () => void;
}) {
  const pct = ((current) / total) * 100;
  const isLow = timeLeft < 300;

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: "oklch(0.14 0.025 260 / 0.97)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="container">
        <div className="flex items-center justify-between py-3 gap-3">
          {/* Logo */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="flex-shrink-0 w-8 h-8 rounded flex items-center justify-center font-bold text-sm"
              style={{
                background: "oklch(0.87 0.18 90)",
                color: "oklch(0.12 0.02 260)",
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              DE
            </div>
            <div>
              <div className="font-bold text-sm" style={{ color: "var(--foreground)" }}>Exam Mode</div>
              <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                Question {Math.min(current + 1, total)} of {total}
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <TranslationToggle />
            {/* Timer */}
            <div
              className="text-sm font-bold px-3 py-1.5 rounded"
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                background: isLow ? "oklch(0.17 0.05 25)" : "var(--secondary)",
                color: isLow ? "oklch(0.78 0.15 25)" : "var(--foreground)",
                border: `1px solid ${isLow ? "oklch(0.55 0.22 25 / 0.5)" : "var(--border)"}`,
              }}
            >
              {formatTime(timeLeft)}
            </div>
            <button
              onClick={onExit}
              className="text-xs px-3 py-1.5 rounded transition-all"
              style={{
                background: "var(--secondary)",
                color: "var(--muted-foreground)",
                border: "1px solid var(--border)",
              }}
            >
              Exit
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="pb-3">
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                background: pct === 100 ? "oklch(0.55 0.18 145)" : "oklch(0.87 0.18 90)",
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

// ── Single exam question ──────────────────────────────────────────────────────
function ExamQuestion({
  question,
  questionNumber,
  onAnswer,
}: {
  question: Question;
  questionNumber: number;
  onAnswer: (isCorrect: boolean) => void;
}) {
  const { showTranslation } = useTranslation();
  const [revealed, setRevealed] = useState(false);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
  const isNrw = question.section === "nrw";

  // Reset state when question changes
  useEffect(() => {
    setRevealed(false);
    setWasCorrect(null);
  }, [question]);

  const handleClick = (answerText: string) => {
    if (revealed) return;
    const correct = answerText === question.correct_answer;
    setRevealed(true);
    setWasCorrect(correct);
    onAnswer(correct);
  };

  return (
    <div className="question-card">
      {/* Question header */}
      <div className="flex items-start gap-3 mb-4">
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
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold leading-snug" style={{ color: "var(--foreground)" }}>
            {question.question}
          </p>
          {showTranslation && (
            <p className="text-sm italic mt-1 leading-snug" style={{ color: "var(--muted-foreground)" }}>
              {question.question_en}
            </p>
          )}
        </div>
      </div>

      {/* Answers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {question.all_answers.map((ans, i) => {
          const isCorrect = ans === question.correct_answer;
          const stateClass = revealed ? (isCorrect ? "correct revealed" : "wrong revealed") : "";
          return (
            <button
              key={i}
              className={`answer-option ${stateClass}`}
              onClick={() => handleClick(ans)}
              disabled={revealed}
            >
              <div className="flex items-start gap-3">
                <span
                  className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-xs font-bold mt-0.5"
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    background: revealed
                      ? isCorrect ? "oklch(0.55 0.18 145 / 0.3)" : "oklch(0.55 0.22 25 / 0.3)"
                      : "var(--border)",
                    color: revealed
                      ? isCorrect ? "var(--correct-text)" : "var(--wrong-text)"
                      : "var(--muted-foreground)",
                  }}
                >
                  {revealed ? (isCorrect ? "✓" : "✗") : LETTER[i]}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium leading-snug">{ans}</div>
                  {showTranslation && (
                    <div
                      className="text-xs italic mt-0.5 leading-snug"
                      style={{
                        color: revealed
                          ? isCorrect ? "oklch(0.65 0.12 145)" : "oklch(0.60 0.12 25)"
                          : "var(--muted-foreground)",
                      }}
                    >
                      {question.all_answers_en?.[i] ?? ans}
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {revealed && (
        <div
          className="mt-3 text-xs font-medium flex items-center gap-1.5"
          style={{ color: wasCorrect ? "oklch(0.80 0.15 145)" : "oklch(0.78 0.15 25)" }}
        >
          {wasCorrect ? "✓ Correct!" : "✗ Wrong — the correct answer is highlighted above."}
        </div>
      )}
    </div>
  );
}

// ── Score summary ─────────────────────────────────────────────────────────────
function ScoreSummary({
  questions,
  answers,
  timeTaken,
  onRetry,
  onHome,
}: {
  questions: Question[];
  answers: (boolean | null)[];
  timeTaken: number;
  onRetry: () => void;
  onHome: () => void;
}) {
  const correct = answers.filter(Boolean).length;
  const passed = correct >= PASS_THRESHOLD;
  const pct = Math.round((correct / TOTAL_QUESTIONS) * 100);

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <FlagStripe />
      <div className="container py-10">
        {/* Result banner */}
        <div
          className="rounded-xl p-8 mb-6 text-center"
          style={{
            background: passed ? "oklch(0.18 0.06 145)" : "oklch(0.17 0.05 25)",
            border: `2px solid ${passed ? "oklch(0.55 0.18 145)" : "oklch(0.55 0.22 25)"}`,
          }}
        >
          <div className="text-5xl mb-3">{passed ? "🎉" : "📚"}</div>
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: passed ? "oklch(0.80 0.15 145)" : "oklch(0.78 0.15 25)" }}
          >
            {passed ? "Bestanden!" : "Nicht bestanden"}
          </h1>
          <p className="text-lg mb-1" style={{ color: "var(--foreground)" }}>
            {passed ? "You passed the exam." : "You did not pass this time."}
          </p>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            {passed
              ? "Congratulations — you scored above the passing threshold."
              : `You need at least ${PASS_THRESHOLD} correct answers to pass.`}
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Correct", value: correct, color: "oklch(0.80 0.15 145)" },
            { label: "Wrong", value: TOTAL_QUESTIONS - correct, color: "oklch(0.78 0.15 25)" },
            { label: "Score", value: `${pct}%`, color: "oklch(0.87 0.18 90)" },
            { label: "Time", value: formatTime(timeTaken), color: "var(--foreground)" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg p-4 text-center"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}
            >
              <div className="text-2xl font-bold" style={{ color: stat.color, fontFamily: "'IBM Plex Mono', monospace" }}>
                {stat.value}
              </div>
              <div className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Passing info */}
        <div
          className="rounded-lg p-4 mb-6 text-sm"
          style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--muted-foreground)" }}
        >
          <strong style={{ color: "var(--foreground)" }}>Official passing threshold:</strong> {PASS_THRESHOLD} out of {TOTAL_QUESTIONS} correct ({Math.round((PASS_THRESHOLD / TOTAL_QUESTIONS) * 100)}%).
          The real exam consists of 33 questions drawn from the general catalog and your state-specific questions.
        </div>

        {/* Question review */}
        <h2 className="text-base font-bold mb-3" style={{ color: "var(--foreground)" }}>
          Question Review
        </h2>
        <div className="space-y-2 mb-8">
          {questions.map((q, i) => {
            const correct = answers[i] === true;
            const answered = answers[i] !== null;
            return (
              <div
                key={i}
                className="rounded-lg p-3 flex items-start gap-3"
                style={{
                  background: answered
                    ? correct ? "oklch(0.18 0.06 145)" : "oklch(0.17 0.05 25)"
                    : "var(--card)",
                  border: `1px solid ${answered
                    ? correct ? "oklch(0.40 0.12 145)" : "oklch(0.40 0.15 25)"
                    : "var(--border)"}`,
                }}
              >
                <span
                  className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-xs font-bold"
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    background: answered
                      ? correct ? "oklch(0.55 0.18 145 / 0.3)" : "oklch(0.55 0.22 25 / 0.3)"
                      : "var(--border)",
                    color: answered
                      ? correct ? "oklch(0.80 0.15 145)" : "oklch(0.78 0.15 25)"
                      : "var(--muted-foreground)",
                  }}
                >
                  {answered ? (correct ? "✓" : "✗") : "–"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium leading-snug" style={{ color: "var(--foreground)" }}>
                    {q.question}
                  </div>
                  {!correct && answered && (
                    <div className="text-xs mt-0.5" style={{ color: "oklch(0.80 0.15 145)" }}>
                      Correct: {q.correct_answer}
                    </div>
                  )}
                </div>
                <span
                  className="flex-shrink-0 text-xs px-2 py-0.5 rounded"
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    background: q.section === "nrw" ? "oklch(0.22 0.06 145)" : "oklch(0.20 0.04 260)",
                    color: q.section === "nrw" ? "oklch(0.65 0.15 145)" : "oklch(0.87 0.18 90)",
                  }}
                >
                  {q.section === "nrw" ? "NRW" : `Q${q.number}`}
                </span>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={onRetry}
            className="px-6 py-3 rounded font-semibold text-sm transition-all"
            style={{ background: "oklch(0.87 0.18 90)", color: "oklch(0.12 0.02 260)" }}
          >
            Try Again (New Questions)
          </button>
          <button
            onClick={onHome}
            className="px-6 py-3 rounded font-semibold text-sm transition-all"
            style={{ background: "var(--secondary)", color: "var(--foreground)", border: "1px solid var(--border)" }}
          >
            Back to Question Browser
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Start screen ──────────────────────────────────────────────────────────────
function StartScreen({ onStart, onHome }: { onStart: () => void; onHome: () => void }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
      <FlagStripe />
      <div className="container flex-1 flex flex-col items-center justify-center py-16">
        <div
          className="w-full max-w-lg rounded-xl p-8"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl mb-6 mx-auto"
            style={{
              background: "oklch(0.87 0.18 90)",
              color: "oklch(0.12 0.02 260)",
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            DE
          </div>
          <h1 className="text-2xl font-bold text-center mb-2" style={{ color: "var(--foreground)" }}>
            Einbürgerungstest
          </h1>
          <p className="text-center text-sm mb-6" style={{ color: "var(--muted-foreground)" }}>
            Exam Simulation
          </p>

          {/* Exam details */}
          <div className="space-y-2 mb-6">
            {[
              ["Questions", `${TOTAL_QUESTIONS} total (${GENERAL_COUNT} general + ${NRW_COUNT} NRW)`],
              ["Time limit", `${EXAM_MINUTES} minutes`],
              ["Passing score", `${PASS_THRESHOLD} correct (${Math.round((PASS_THRESHOLD / TOTAL_QUESTIONS) * 100)}%)`],
              ["Format", "One question at a time · Click to reveal answer"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-start justify-between gap-4 py-2"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>{label}</span>
                <span className="text-sm font-medium text-right" style={{ color: "var(--foreground)" }}>{value}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={onStart}
              className="w-full py-3 rounded-lg font-bold text-base transition-all"
              style={{ background: "oklch(0.87 0.18 90)", color: "oklch(0.12 0.02 260)" }}
            >
              Start Exam
            </button>
            <button
              onClick={onHome}
              className="w-full py-3 rounded-lg font-medium text-sm transition-all"
              style={{ background: "var(--secondary)", color: "var(--muted-foreground)", border: "1px solid var(--border)" }}
            >
              Back to Question Browser
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Exam Page ────────────────────────────────────────────────────────────
type ExamPhase = "start" | "running" | "done";

export default function Exam() {
  const [, navigate] = useLocation();
  const [phase, setPhase] = useState<ExamPhase>("start");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<(boolean | null)[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(EXAM_MINUTES * 60);
  const [timeTaken, setTimeTaken] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startExam = useCallback(() => {
    const qs = generateExam();
    setQuestions(qs);
    setCurrentIdx(0);
    setAnswers(new Array(qs.length).fill(null));
    setRevealed(false);
    setTimeLeft(EXAM_MINUTES * 60);
    setTimeTaken(0);
    setPhase("running");
  }, []);

  // Timer
  useEffect(() => {
    if (phase !== "running") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setTimeTaken(EXAM_MINUTES * 60);
          setPhase("done");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [phase]);

  const handleAnswer = useCallback((isCorrect: boolean) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIdx] = isCorrect;
      return next;
    });
    setRevealed(true);
  }, [currentIdx]);

  const handleNext = useCallback(() => {
    if (currentIdx + 1 >= TOTAL_QUESTIONS) {
      // Finish
      clearInterval(timerRef.current!);
      setTimeTaken(EXAM_MINUTES * 60 - timeLeft);
      setPhase("done");
    } else {
      setCurrentIdx((i) => i + 1);
      setRevealed(false);
    }
  }, [currentIdx, timeLeft]);

  const handleExit = useCallback(() => {
    clearInterval(timerRef.current!);
    navigate("/");
  }, [navigate]);

  if (phase === "start") {
    return <StartScreen onStart={startExam} onHome={() => navigate("/")} />;
  }

  if (phase === "done") {
    return (
      <ScoreSummary
        questions={questions}
        answers={answers}
        timeTaken={timeTaken}
        onRetry={startExam}
        onHome={() => navigate("/")}
      />
    );
  }

  const currentQuestion = questions[currentIdx];

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <FlagStripe />
      <ExamHeader
        current={currentIdx}
        total={TOTAL_QUESTIONS}
        timeLeft={timeLeft}
        onExit={handleExit}
      />

      <main className="container py-6 pb-16">
        {/* Question counter pills */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {questions.map((_, i) => (
            <div
              key={i}
              className="w-6 h-6 rounded text-xs flex items-center justify-center font-medium"
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                background:
                  i === currentIdx
                    ? "oklch(0.87 0.18 90)"
                    : answers[i] === true
                    ? "oklch(0.18 0.06 145)"
                    : answers[i] === false
                    ? "oklch(0.17 0.05 25)"
                    : "var(--secondary)",
                color:
                  i === currentIdx
                    ? "oklch(0.12 0.02 260)"
                    : answers[i] === true
                    ? "oklch(0.80 0.15 145)"
                    : answers[i] === false
                    ? "oklch(0.78 0.15 25)"
                    : "var(--muted-foreground)",
                border: i === currentIdx ? "none" : "1px solid var(--border)",
              }}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Current question */}
        <ExamQuestion
          key={currentIdx}
          question={currentQuestion}
          questionNumber={currentIdx + 1}
          onAnswer={handleAnswer}
        />

        {/* Next button — appears after answer is revealed */}
        {revealed && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleNext}
              className="px-6 py-3 rounded-lg font-bold text-sm transition-all"
              style={{ background: "oklch(0.87 0.18 90)", color: "oklch(0.12 0.02 260)" }}
            >
              {currentIdx + 1 >= TOTAL_QUESTIONS ? "See Results →" : "Next Question →"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
