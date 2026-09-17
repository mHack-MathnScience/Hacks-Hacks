import { create } from "zustand";
import { persist } from "zustand/middleware";
import { LABS } from "./labs";

export type Trial = Record<string, string | number>;

export type LabRecord = {
  finished: boolean;
  claim: string;
  trials: Trial[];
};

type LabState = {
  byLab: Record<string, LabRecord>;
  quiz: { score: number; total: number; at: number } | null;
  markFinished: (id: string) => void;
  saveClaim: (id: string, claim: string) => void;
  addTrial: (id: string, trial: Trial) => void;
  saveQuiz: (score: number, total: number) => void;
  resetLabs: () => void;
};

const emptyRec = (): LabRecord => ({ finished: false, claim: "", trials: [] });

export const useLabStore = create<LabState>()(
  persist(
    (set) => ({
      byLab: {},
      quiz: null,
      markFinished: (id) =>
        set((s) => ({
          byLab: { ...s.byLab, [id]: { ...(s.byLab[id] ?? emptyRec()), finished: true } },
        })),
      saveClaim: (id, claim) =>
        set((s) => ({
          byLab: { ...s.byLab, [id]: { ...(s.byLab[id] ?? emptyRec()), claim: claim.trim().slice(0, 400) } },
        })),
      addTrial: (id, trial) =>
        set((s) => {
          const prev = s.byLab[id] ?? emptyRec();
          return {
            byLab: { ...s.byLab, [id]: { ...prev, trials: [...prev.trials, trial].slice(-12) } },
          };
        }),
      saveQuiz: (score, total) => set({ quiz: { score, total, at: Date.now() } }),
      resetLabs: () => set({ byLab: {}, quiz: null }),
    }),
    { name: "hacks-hacks-science-labs" },
  ),
);

export function labRecord(byLab: Record<string, LabRecord>, id: string): LabRecord {
  return byLab[id] ?? emptyRec();
}

export function finishedCount(byLab: Record<string, LabRecord>): number {
  return LABS.filter((l) => byLab[l.id]?.finished).length;
}
