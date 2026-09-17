import type { Strand, StudentExpectation } from "./types";

export const STRANDS: Strand[] = [
  {
    id: "5.2",
    code: "5.2",
    title: "Place Value & Decimals",
    blurb: "Read, compare, and round decimals through thousandths.",
    category: "numerical",
    categoryLabel: "Numerical representations",
  },
  {
    id: "5.3",
    code: "5.3",
    title: "Operations",
    blurb: "Multiply, divide, add, and subtract whole numbers, decimals, and fractions.",
    category: "computation",
    categoryLabel: "Computations & algebraic relationships",
  },
  {
    id: "5.4",
    code: "5.4",
    title: "Algebraic Reasoning",
    blurb: "Expressions, equations, patterns, and measurement formulas.",
    category: "computation",
    categoryLabel: "Computations & algebraic relationships",
  },
  {
    id: "5.5",
    code: "5.5",
    title: "Classifying Figures",
    blurb: "Sort two-dimensional figures by attributes and properties.",
    category: "geometry",
    categoryLabel: "Geometry & measurement",
  },
  {
    id: "5.6",
    code: "5.6",
    title: "Volume",
    blurb: "Count unit cubes and find the volume of rectangular prisms.",
    category: "geometry",
    categoryLabel: "Geometry & measurement",
  },
  {
    id: "5.7",
    code: "5.7",
    title: "Conversions",
    blurb: "Convert measurements within the customary or metric system.",
    category: "geometry",
    categoryLabel: "Geometry & measurement",
  },
  {
    id: "5.8",
    code: "5.8",
    title: "Coordinate Plane",
    blurb: "Graph and read ordered pairs in the first quadrant.",
    category: "geometry",
    categoryLabel: "Geometry & measurement",
  },
  {
    id: "5.9",
    code: "5.9",
    title: "Data Analysis",
    blurb: "Read graphs, tables, and scatterplots to solve problems.",
    category: "data",
    categoryLabel: "Data analysis & personal financial literacy",
  },
  {
    id: "5.10",
    code: "5.10",
    title: "Financial Literacy",
    blurb: "Taxes, income, payment methods, and a simple budget.",
    category: "data",
    categoryLabel: "Data analysis & personal financial literacy",
  },
];

export const EXPECTATIONS: StudentExpectation[] = [
  {
    id: "5.2A",
    strandId: "5.2",
    code: "5.2(A)",
    kidTitle: "Decimal place value",
    official:
      "Represent the value of the digit in decimals through the thousandths using expanded notation and numerals.",
    weight: "supporting",
  },
  {
    id: "5.2B",
    strandId: "5.2",
    code: "5.2(B)",
    kidTitle: "Compare and order decimals",
    official: "Compare and order two decimals to thousandths and represent comparisons using the symbols >, <, or =.",
    weight: "readiness",
  },
  {
    id: "5.2C",
    strandId: "5.2",
    code: "5.2(C)",
    kidTitle: "Round decimals",
    official: "Round decimals to tenths or hundredths.",
    weight: "supporting",
  },
  {
    id: "5.3A",
    strandId: "5.3",
    code: "5.3(A)",
    kidTitle: "Estimate with the four operations",
    official:
      "Estimate to determine solutions to mathematical and real-world problems involving addition, subtraction, multiplication, or division.",
    weight: "supporting",
  },
  {
    id: "5.3B",
    strandId: "5.3",
    code: "5.3(B)",
    kidTitle: "Multiply 3-digit by 2-digit",
    official: "Multiply with fluency a three-digit number by a two-digit number using the standard algorithm.",
    weight: "supporting",
  },
  {
    id: "5.3C",
    strandId: "5.3",
    code: "5.3(C)",
    kidTitle: "Divide up to 4-digit by 2-digit",
    official:
      "Solve with proficiency for quotients of up to a four-digit dividend by a two-digit divisor using strategies and the standard algorithm.",
    weight: "supporting",
  },
  {
    id: "5.3D",
    strandId: "5.3",
    code: "5.3(D)",
    kidTitle: "Model decimal multiplication",
    official:
      "Represent multiplication of decimals with products to the hundredths using objects and pictorial models, including area models.",
    weight: "supporting",
  },
  {
    id: "5.3E",
    strandId: "5.3",
    code: "5.3(E)",
    kidTitle: "Multiply decimals",
    official:
      "Solve for products of decimals to the hundredths, including situations involving money, using strategies based on place-value understandings, properties of operations, and the relationship to the multiplication of whole numbers.",
    weight: "readiness",
  },
  {
    id: "5.3F",
    strandId: "5.3",
    code: "5.3(F)",
    kidTitle: "Model decimal division",
    official:
      "Represent quotients of decimals to the hundredths, up to four-digit dividends and two-digit whole number divisors, using objects and pictorial models, including area models.",
    weight: "supporting",
  },
  {
    id: "5.3G",
    strandId: "5.3",
    code: "5.3(G)",
    kidTitle: "Divide decimals",
    official:
      "Solve for quotients of decimals to the hundredths, up to four-digit dividends and two-digit whole number divisors, using strategies and algorithms, including the standard algorithm.",
    weight: "readiness",
  },
  {
    id: "5.3H",
    strandId: "5.3",
    code: "5.3(H)",
    kidTitle: "Add and subtract unlike fractions",
    official:
      "Represent and solve addition and subtraction of fractions with unequal denominators referring to the same whole using objects and pictorial models and properties of operations.",
    weight: "supporting",
  },
  {
    id: "5.3I",
    strandId: "5.3",
    code: "5.3(I)",
    kidTitle: "Multiply a whole number by a fraction",
    official:
      "Represent and solve multiplication of a whole number and a fraction that refers to the same whole using objects and pictorial models, including area models.",
    weight: "supporting",
  },
  {
    id: "5.3J",
    strandId: "5.3",
    code: "5.3(J)",
    kidTitle: "Model dividing with unit fractions",
    official:
      "Represent division of a unit fraction by a whole number and the division of a whole number by a unit fraction using objects and pictorial models, including area models.",
    weight: "supporting",
  },
  {
    id: "5.3K",
    strandId: "5.3",
    code: "5.3(K)",
    kidTitle: "Add and subtract rational numbers",
    official: "Add and subtract positive rational numbers fluently.",
    weight: "readiness",
  },
  {
    id: "5.3L",
    strandId: "5.3",
    code: "5.3(L)",
    kidTitle: "Divide with unit fractions",
    official: "Divide whole numbers by unit fractions and unit fractions by whole numbers.",
    weight: "readiness",
  },
  {
    id: "5.4A",
    strandId: "5.4",
    code: "5.4(A)",
    kidTitle: "Prime and composite",
    official: "Identify prime and composite numbers.",
    weight: "supporting",
  },
  {
    id: "5.4B",
    strandId: "5.4",
    code: "5.4(B)",
    kidTitle: "Multi-step equations",
    official:
      "Represent and solve multi-step problems involving the four operations with whole numbers using equations with a letter standing for the unknown quantity.",
    weight: "readiness",
  },
  {
    id: "5.4C",
    strandId: "5.4",
    code: "5.4(C)",
    kidTitle: "Numerical patterns",
    official: "Generate a numerical pattern when given a rule in the form y = ax or y = x + a and graph.",
    weight: "readiness",
  },
  {
    id: "5.4D",
    strandId: "5.4",
    code: "5.4(D)",
    kidTitle: "Additive vs multiplicative patterns",
    official: "Recognize the difference between additive and multiplicative numerical patterns given in a table or graph.",
    weight: "supporting",
  },
  {
    id: "5.4E",
    strandId: "5.4",
    code: "5.4(E)",
    kidTitle: "Grouping symbols",
    official: "Describe the meaning of parentheses and brackets in a numeric expression.",
    weight: "supporting",
  },
  {
    id: "5.4F",
    strandId: "5.4",
    code: "5.4(F)",
    kidTitle: "Simplify expressions",
    official: "Simplify numerical expressions that do not involve exponents, including up to two levels of grouping.",
    weight: "readiness",
  },
  {
    id: "5.4G",
    strandId: "5.4",
    code: "5.4(G)",
    kidTitle: "Volume formulas",
    official:
      "Use concrete objects and pictorial models to develop the formulas for the volume of a rectangular prism, including the special form for a cube (V = l × w × h, V = s × s × s, and V = Bh).",
    weight: "classroom",
  },
  {
    id: "5.4H",
    strandId: "5.4",
    code: "5.4(H)",
    kidTitle: "Perimeter, area, and volume",
    official: "Represent and solve problems related to perimeter and/or area and related to volume.",
    weight: "readiness",
  },
  {
    id: "5.5A",
    strandId: "5.5",
    code: "5.5(A)",
    kidTitle: "Classify 2D figures",
    official:
      "Classify two-dimensional figures in a hierarchy of sets and subsets using graphic organizers based on their attributes and properties.",
    weight: "readiness",
  },
  {
    id: "5.6A",
    strandId: "5.6",
    code: "5.6(A)",
    kidTitle: "Unit cubes and volume",
    official:
      "Recognize a cube with side length of one unit as a unit cube having one cubic unit of volume and the volume of a three-dimensional figure as the number of unit cubes needed to fill it with no gaps or overlaps if possible.",
    weight: "supporting",
  },
  {
    id: "5.6B",
    strandId: "5.6",
    code: "5.6(B)",
    kidTitle: "Volume as layers",
    official:
      "Determine the volume of a rectangular prism with whole number side lengths in problems related to the number of layers times the number of unit cubes in each layer.",
    weight: "supporting",
  },
  {
    id: "5.7A",
    strandId: "5.7",
    code: "5.7(A)",
    kidTitle: "Measurement conversions",
    official: "Solve problems by calculating conversions within a measurement system, customary or metric.",
    weight: "supporting",
  },
  {
    id: "5.8A",
    strandId: "5.8",
    code: "5.8(A)",
    kidTitle: "Attributes of the coordinate plane",
    official:
      "Describe the key attributes of the coordinate plane, including perpendicular number lines (axes) that intersect at the origin (0, 0), and ordered pairs (x, y).",
    weight: "supporting",
  },
  {
    id: "5.8B",
    strandId: "5.8",
    code: "5.8(B)",
    kidTitle: "How to graph ordered pairs",
    official: "Describe the process for graphing ordered pairs of numbers in the first quadrant of the coordinate plane.",
    weight: "supporting",
  },
  {
    id: "5.8C",
    strandId: "5.8",
    code: "5.8(C)",
    kidTitle: "Graph ordered pairs",
    official:
      "Graph in the first quadrant of the coordinate plane ordered pairs of numbers arising from mathematical and real-world problems, including those generated by number patterns or found in an input-output table.",
    weight: "readiness",
  },
  {
    id: "5.9A",
    strandId: "5.9",
    code: "5.9(A)",
    kidTitle: "Represent data",
    official:
      "Represent categorical data with bar graphs or frequency tables and numerical data, including data sets of measurements in fractions or decimals, with dot plots or stem-and-leaf plots.",
    weight: "supporting",
  },
  {
    id: "5.9B",
    strandId: "5.9",
    code: "5.9(B)",
    kidTitle: "Scatterplots",
    official: "Represent discrete paired data on a scatterplot.",
    weight: "supporting",
  },
  {
    id: "5.9C",
    strandId: "5.9",
    code: "5.9(C)",
    kidTitle: "Solve problems with data",
    official:
      "Solve one- and two-step problems using data from a frequency table, dot plot, bar graph, stem-and-leaf plot, or scatterplot.",
    weight: "readiness",
  },
  {
    id: "5.10A",
    strandId: "5.10",
    code: "5.10(A)",
    kidTitle: "Types of taxes",
    official: "Define income tax, payroll tax, sales tax, and property tax.",
    weight: "supporting",
  },
  {
    id: "5.10B",
    strandId: "5.10",
    code: "5.10(B)",
    kidTitle: "Gross vs net income",
    official: "Explain the difference between gross income and net income.",
    weight: "supporting",
  },
  {
    id: "5.10C",
    strandId: "5.10",
    code: "5.10(C)",
    kidTitle: "Methods of payment",
    official:
      "Identify the advantages and disadvantages of different methods of payment, including check, credit card, debit card, and electronic payments.",
    weight: "classroom",
  },
  {
    id: "5.10D",
    strandId: "5.10",
    code: "5.10(D)",
    kidTitle: "Financial records",
    official: "Develop a system for keeping and using financial records.",
    weight: "classroom",
  },
  {
    id: "5.10E",
    strandId: "5.10",
    code: "5.10(E)",
    kidTitle: "When expenses exceed income",
    official: "Describe actions that might be taken to balance a budget when expenses exceed income.",
    weight: "supporting",
  },
  {
    id: "5.10F",
    strandId: "5.10",
    code: "5.10(F)",
    kidTitle: "Balance a budget",
    official: "Balance a simple budget.",
    weight: "supporting",
  },
];

export const READINESS_IDS = EXPECTATIONS.filter((e) => e.weight === "readiness").map((e) => e.id);

export function strandById(id: string): Strand | undefined {
  return STRANDS.find((s) => s.id === id);
}

export function expectationById(id: string): StudentExpectation | undefined {
  return EXPECTATIONS.find((e) => e.id === id);
}

export function expectationsForStrand(strandId: string): StudentExpectation[] {
  return EXPECTATIONS.filter((e) => e.strandId === strandId);
}

export function poolForKey(key: string): string[] {
  if (key === "staar" || key === "mix") return [...READINESS_IDS];
  const strand = strandById(key);
  if (strand) return expectationsForStrand(strand.id).map((e) => e.id);
  const se = expectationById(key);
  if (se) return [se.id];
  return [];
}

export function labelForKey(key: string): { title: string; kicker: string } {
  if (key === "staar" || key === "mix") {
    return { title: "STAAR Mix", kicker: "Readiness standards" };
  }
  const strand = strandById(key);
  if (strand) return { title: strand.title, kicker: `TEKS ${strand.code}` };
  const se = expectationById(key);
  if (se) return { title: se.kidTitle, kicker: se.code };
  return { title: "Practice", kicker: "TEKS" };
}
