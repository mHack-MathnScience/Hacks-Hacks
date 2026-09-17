import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TeksStat = {
  attempted: number;
  correct: number;
  lastAt: number;
};

type ProgressState = {
  name: string;
  byTeks: Record<string, TeksStat>;
  streak: number;
  bestStreak: number;
  totalCorrect: number;
  totalAttempted: number;
  setName: (name: string) => void;
  record: (teks: string, correct: boolean) => void;
  reset: () => void;
};

const empty = {
  name: "",
  byTeks: {} as Record<string, TeksStat>,
  streak: 0,
  bestStreak: 0,
  totalCorrect: 0,
  totalAttempted: 0,
};

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      ...empty,
      setName: (name) => set({ name: name.trim().slice(0, 32) }),
      record: (teks, correct) =>
        set((state) => {
          const prev = state.byTeks[teks] ?? { attempted: 0, correct: 0, lastAt: 0 };
          const streak = correct ? state.streak + 1 : 0;
          return {
            streak,
            bestStreak: Math.max(state.bestStreak, streak),
            totalAttempted: state.totalAttempted + 1,
            totalCorrect: state.totalCorrect + (correct ? 1 : 0),
            byTeks: {
              ...state.byTeks,
              [teks]: {
                attempted: prev.attempted + 1,
                correct: prev.correct + (correct ? 1 : 0),
                lastAt: Date.now(),
              },
            },
          };
        }),
      reset: () => set((state) => ({ ...empty, name: state.name })),
    }),
    { name: "fifth-station-progress" },
  ),
);

export function accuracy(stat?: TeksStat): number | null {
  if (!stat || stat.attempted === 0) return null;
  return Math.round((stat.correct / stat.attempted) * 100);
}
