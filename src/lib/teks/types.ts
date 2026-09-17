export type ReportingCategory = "numerical" | "computation" | "geometry" | "data";

export type StaarWeight = "readiness" | "supporting" | "classroom";

export type Strand = {
  id: string;
  code: string;
  title: string;
  blurb: string;
  category: ReportingCategory;
  categoryLabel: string;
};

export type StudentExpectation = {
  id: string;
  strandId: string;
  code: string;
  kidTitle: string;
  official: string;
  weight: StaarWeight;
};

export type Visual =
  | { kind: "grid10"; cols: number; rows: number }
  | { kind: "tenth-bar"; totalTenths: number; groupTenths: number }
  | { kind: "fraction-bars"; bars: Array<{ label: string; num: number; den: number }> }
  | { kind: "number-line"; min: number; max: number; tick: number; mark: number; label: string }
  | { kind: "prism"; l: number; w: number; h: number }
  | { kind: "cubes"; l: number; w: number; h: number }
  | { kind: "coordinate"; points: Array<{ x: number; y: number; label?: string }>; highlight?: { x: number; y: number } }
  | { kind: "bar"; title: string; unit: string; bars: Array<{ label: string; value: number }> }
  | { kind: "dots"; title: string; unit: string; values: number[] }
  | { kind: "stemleaf"; title: string; unit: string; data: number[] }
  | { kind: "scatter"; title: string; xLabel: string; yLabel: string; points: Array<{ x: number; y: number }> }
  | { kind: "table"; caption?: string; headers: string[]; rows: string[][] }
  | { kind: "shape"; figure: string };

export type Choice = { id: string; text: string };

export type QuestionKind = "mc" | "input";

export type Question = {
  id: string;
  teks: string;
  stem: string;
  expression?: string;
  kind: QuestionKind;
  choices?: Choice[];
  correct: string;
  accept?: string[];
  inputHint?: string;
  explanation: string;
  visual?: Visual;
};
