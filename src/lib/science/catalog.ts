import type { Strand, StudentExpectation } from "@/lib/teks/types";

export const SCI_STRANDS: Strand[] = [
  {
    id: "sci-5.6",
    code: "5.6",
    title: "Matter & Properties",
    blurb: "Physical properties, mixtures, solutions, and particles too small to see.",
    category: "geometry",
    categoryLabel: "Matter and its properties",
  },
  {
    id: "sci-5.7",
    code: "5.7",
    title: "Forces & Motion",
    blurb: "Equal and unequal forces, and investigations of force on a system.",
    category: "geometry",
    categoryLabel: "Force, motion, and energy",
  },
  {
    id: "sci-5.8",
    code: "5.8",
    title: "Energy, Circuits & Light",
    blurb: "Energy transformations, complete circuits, and how light travels.",
    category: "geometry",
    categoryLabel: "Force, motion, and energy",
  },
  {
    id: "sci-5.9",
    code: "5.9",
    title: "Sun, Earth & Shadows",
    blurb: "Earth’s rotation, day and night, and moving shadows.",
    category: "data",
    categoryLabel: "Earth and space",
  },
  {
    id: "sci-5.10",
    code: "5.10",
    title: "Earth’s Processes",
    blurb: "The water cycle, sedimentary rock, fossil fuels, and landforms.",
    category: "data",
    categoryLabel: "Earth and space",
  },
  {
    id: "sci-5.11",
    code: "5.11",
    title: "Natural Resources",
    blurb: "Conservation, recycling, and reducing the impact of resource use.",
    category: "data",
    categoryLabel: "Earth and space",
  },
  {
    id: "sci-5.12",
    code: "5.12",
    title: "Ecosystems",
    blurb: "Biotic and abiotic factors, food webs, and human impact.",
    category: "computation",
    categoryLabel: "Organisms and environments",
  },
  {
    id: "sci-5.13",
    code: "5.13",
    title: "Survival Traits",
    blurb: "Structures and functions, instinct, and learned behavior.",
    category: "computation",
    categoryLabel: "Organisms and environments",
  },
];

export const SCI_EXPECTATIONS: StudentExpectation[] = [
  {
    id: "sci-5.6A",
    strandId: "sci-5.6",
    code: "5.6(A)",
    kidTitle: "Physical properties of matter",
    official:
      "Compare and contrast matter based on measurable, testable, or observable physical properties, including mass, magnetism, relative density, physical state, volume, solubility in water, and the ability to conduct or insulate thermal energy and electric energy.",
    weight: "readiness",
  },
  {
    id: "sci-5.6B",
    strandId: "sci-5.6",
    code: "5.6(B)",
    kidTitle: "Mixtures keep their properties",
    official:
      "Demonstrate and explain that some mixtures maintain physical properties of their substances such as iron filings and sand or sand and water.",
    weight: "readiness",
  },
  {
    id: "sci-5.6C",
    strandId: "sci-5.6",
    code: "5.6(C)",
    kidTitle: "Solutions and conservation of matter",
    official:
      "Compare the properties of substances before and after they are combined into a solution and demonstrate that matter is conserved in solutions.",
    weight: "readiness",
  },
  {
    id: "sci-5.6D",
    strandId: "sci-5.6",
    code: "5.6(D)",
    kidTitle: "Particles too small to see",
    official: "Illustrate how matter is made up of particles that are too small to be seen such as air in a balloon.",
    weight: "supporting",
  },
  {
    id: "sci-5.7A",
    strandId: "sci-5.7",
    code: "5.7(A)",
    kidTitle: "Equal and unequal forces",
    official:
      "Investigate and explain how equal and unequal forces acting on an object cause patterns of motion and transfer of energy.",
    weight: "readiness",
  },
  {
    id: "sci-5.7B",
    strandId: "sci-5.7",
    code: "5.7(B)",
    kidTitle: "Investigate force on a system",
    official:
      "Design a simple experimental investigation that tests the effect of force on an object in a system such as a car on a ramp or a balloon rocket on a string.",
    weight: "supporting",
  },
  {
    id: "sci-5.8A",
    strandId: "sci-5.8",
    code: "5.8(A)",
    kidTitle: "Energy transformations",
    official:
      "Investigate and describe the transformation of energy in systems such as energy in a flashlight battery that changes from chemical energy to electrical energy to light energy.",
    weight: "readiness",
  },
  {
    id: "sci-5.8B",
    strandId: "sci-5.8",
    code: "5.8(B)",
    kidTitle: "Complete circuits",
    official:
      "Demonstrate that electrical energy in complete circuits can be transformed into motion, light, sound, or thermal energy and identify the requirements for a functioning electrical circuit.",
    weight: "readiness",
  },
  {
    id: "sci-5.8C",
    strandId: "sci-5.8",
    code: "5.8(C)",
    kidTitle: "How light travels",
    official: "Demonstrate and explain how light travels in a straight line and can be reflected, refracted, or absorbed.",
    weight: "readiness",
  },
  {
    id: "sci-5.9A",
    strandId: "sci-5.9",
    code: "5.9(A)",
    kidTitle: "Rotation, day and night, shadows",
    official:
      "Demonstrate that Earth rotates on its axis once approximately every 24 hours and explain how that causes the day/night cycle and the appearance of the Sun moving across the sky, resulting in changes in shadow positions and shapes.",
    weight: "readiness",
  },
  {
    id: "sci-5.10A",
    strandId: "sci-5.10",
    code: "5.10(A)",
    kidTitle: "Sun, ocean, and the water cycle",
    official: "Explain how the Sun and the ocean interact in the water cycle and affect weather.",
    weight: "readiness",
  },
  {
    id: "sci-5.10B",
    strandId: "sci-5.10",
    code: "5.10(B)",
    kidTitle: "Sedimentary rock and fossil fuels",
    official: "Model and describe the processes that led to the formation of sedimentary rocks and fossil fuels.",
    weight: "readiness",
  },
  {
    id: "sci-5.10C",
    strandId: "sci-5.10",
    code: "5.10(C)",
    kidTitle: "Landforms from wind, water, or ice",
    official:
      "Model and identify how changes to Earth’s surface by wind, water, or ice result in the formation of landforms, including deltas, canyons, and sand dunes.",
    weight: "readiness",
  },
  {
    id: "sci-5.11A",
    strandId: "sci-5.11",
    code: "5.11(A)",
    kidTitle: "Conserving natural resources",
    official:
      "Design and explain solutions such as conservation, recycling, or proper disposal to minimize environmental impact of the use of natural resources.",
    weight: "supporting",
  },
  {
    id: "sci-5.12A",
    strandId: "sci-5.12",
    code: "5.12(A)",
    kidTitle: "Biotic and abiotic factors",
    official:
      "Observe and describe how a variety of organisms survive by interacting with biotic and abiotic factors in a healthy ecosystem.",
    weight: "readiness",
  },
  {
    id: "sci-5.12B",
    strandId: "sci-5.12",
    code: "5.12(B)",
    kidTitle: "Changes in a food web",
    official: "Predict how changes in the ecosystem affect the cycling of matter and flow of energy in a food web.",
    weight: "readiness",
  },
  {
    id: "sci-5.12C",
    strandId: "sci-5.12",
    code: "5.12(C)",
    kidTitle: "Humans and ecosystems",
    official: "Describe a healthy ecosystem and how human activities can be beneficial or harmful to an ecosystem.",
    weight: "readiness",
  },
  {
    id: "sci-5.13A",
    strandId: "sci-5.13",
    code: "5.13(A)",
    kidTitle: "Structures and functions",
    official:
      "Analyze the structures and functions of different species to identify how organisms survive in the same environment.",
    weight: "readiness",
  },
  {
    id: "sci-5.13B",
    strandId: "sci-5.13",
    code: "5.13(B)",
    kidTitle: "Instinct vs learned behavior",
    official:
      "Explain how instinctual behavioral traits such as turtle hatchlings returning to the sea and learned behavioral traits such as orcas hunting in packs increase chances of survival.",
    weight: "readiness",
  },
];

export const SCI_READINESS_IDS = SCI_EXPECTATIONS.filter((e) => e.weight === "readiness").map((e) => e.id);

export function sciStrandById(id: string): Strand | undefined {
  return SCI_STRANDS.find((s) => s.id === id);
}

export function sciExpectationById(id: string): StudentExpectation | undefined {
  return SCI_EXPECTATIONS.find((e) => e.id === id);
}

export function sciExpectationsForStrand(strandId: string): StudentExpectation[] {
  return SCI_EXPECTATIONS.filter((e) => e.strandId === strandId);
}

export function sciPoolForKey(key: string): string[] {
  if (key === "staar" || key === "mix") return [...SCI_READINESS_IDS];
  const strand = sciStrandById(key);
  if (strand) return sciExpectationsForStrand(strand.id).map((e) => e.id);
  const se = sciExpectationById(key);
  if (se) return [se.id];
  return [];
}

export function sciLabelForKey(key: string): { title: string; kicker: string } {
  if (key === "staar" || key === "mix") {
    return { title: "STAAR Mix", kicker: "Science readiness" };
  }
  const strand = sciStrandById(key);
  if (strand) return { title: strand.title, kicker: `TEKS ${strand.code}` };
  const se = sciExpectationById(key);
  if (se) return { title: se.kidTitle, kicker: se.code };
  return { title: "Practice", kicker: "Science TEKS" };
}
