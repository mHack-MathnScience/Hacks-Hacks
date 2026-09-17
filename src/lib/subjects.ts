import {
  SCI_EXPECTATIONS,
  SCI_STRANDS,
  sciExpectationById,
  sciExpectationsForStrand,
  sciLabelForKey,
  sciPoolForKey,
  sciStrandById,
} from "@/lib/science/catalog";
import { generateScienceSet } from "@/lib/science/generate";
import {
  EXPECTATIONS,
  STRANDS,
  expectationById,
  expectationsForStrand,
  labelForKey,
  poolForKey,
  strandById,
} from "@/lib/teks/catalog";
import { generateSet } from "@/lib/teks/generate";
import type { Question, Strand, StudentExpectation } from "@/lib/teks/types";

export type SubjectId = "math" | "science";

export type SubjectDef = {
  id: SubjectId;
  name: string;
  kicker: string;
  tagline: string;
  mixTitle: string;
  mixBlurb: string;
  mixKicker: string;
  strands: Strand[];
  expectations: StudentExpectation[];
  strandById: (id: string) => Strand | undefined;
  expectationById: (id: string) => StudentExpectation | undefined;
  expectationsForStrand: (id: string) => StudentExpectation[];
  poolForKey: (key: string) => string[];
  labelForKey: (key: string) => { title: string; kicker: string };
  generateSet: (key: string, n: number) => Question[];
  footer: string;
};

export const SUBJECTS: Record<SubjectId, SubjectDef> = {
  math: {
    id: "math",
    name: "Math Hacks",
    kicker: "Grade 5 · Mathematics",
    tagline: "Pick a student expectation. Every question is newly generated — decimals, fractions, volume, data, and financial literacy included.",
    mixTitle: "STAAR Mix",
    mixBlurb: "Eight questions sampled from the Grade 5 math readiness standards.",
    mixKicker: "Readiness mix",
    strands: STRANDS,
    expectations: EXPECTATIONS,
    strandById,
    expectationById,
    expectationsForStrand,
    poolForKey,
    labelForKey,
    generateSet,
    footer:
      "Aligned to 19 TAC §111.7, Grade 5 mathematics (adopted 2012). Readiness labels follow the STAAR assessed curriculum. Progress is stored only on this device.",
  },
  science: {
    id: "science",
    name: "Science Hacks",
    kicker: "Grade 5 · Science",
    tagline: "Pick a student expectation. Every item is newly sampled — matter, force, energy, Earth, and ecosystems.",
    mixTitle: "STAAR Mix",
    mixBlurb: "Eight questions sampled from the Grade 5 science readiness standards.",
    mixKicker: "Readiness mix",
    strands: SCI_STRANDS,
    expectations: SCI_EXPECTATIONS,
    strandById: sciStrandById,
    expectationById: sciExpectationById,
    expectationsForStrand: sciExpectationsForStrand,
    poolForKey: sciPoolForKey,
    labelForKey: sciLabelForKey,
    generateSet: generateScienceSet,
    footer:
      "Aligned to 19 TAC §112.16, Grade 5 science (adopted 2021). Readiness labels follow the STAAR assessed curriculum. Progress is stored only on this device.",
  },
};

export function getSubject(id: SubjectId): SubjectDef {
  return SUBJECTS[id];
}

export function isScienceTeks(id: string): boolean {
  return id.startsWith("sci-");
}
