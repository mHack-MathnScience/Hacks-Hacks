import { d as useRouterState, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { d as ClipboardCheck, h as BookOpen, l as GraduationCap, o as Mountain, s as Layers, t as Zap, u as FlaskConical } from "../_libs/lucide-react.mjs";
import { r as cn, t as AppShell } from "./app-shell-Dqa0Wea-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/science-shell-Ba2jLADM.js
var import_jsx_runtime = require_jsx_runtime();
var LAB_UNITS = [
	{
		id: "forces",
		name: "Forces",
		title: "Force labs",
		blurb: "Equal and unequal forces, ramps, rockets, gravity, and magnets.",
		teks: "TEKS 5.7",
		duration: "About 45 minutes"
	},
	{
		id: "landforms",
		name: "Landforms",
		title: "Landform labs",
		blurb: "Canyons, U-shaped valleys, deltas, and sand dunes.",
		teks: "TEKS 5.10C",
		duration: "About 35 minutes"
	},
	{
		id: "circuits",
		name: "Circuits",
		title: "Circuit labs",
		blurb: "Complete paths, energy changes, and conductors vs insulators.",
		teks: "TEKS 5.8B",
		duration: "About 35 minutes"
	},
	{
		id: "rocks",
		name: "Rocks",
		title: "Rock labs",
		blurb: "Weathering, erosion, deposition, compaction, and cementation.",
		teks: "TEKS 5.10B",
		duration: "About 30 minutes"
	}
];
var UNIT_IDS = LAB_UNITS.map((u) => u.id);
function isLabUnit(value) {
	return UNIT_IDS.includes(value);
}
var LABS = [
	{
		id: "equal",
		title: "Equal or Unequal?",
		kicker: "Patterns of motion",
		blurb: "Push a crate from both sides. Watch what equal forces and unequal forces do to motion and energy.",
		teks: ["5.7A"],
		teksPlain: "Investigate how equal and unequal forces cause patterns of motion and transfer of energy.",
		question: "What happens to an object when the forces on it are equal? What if they are not?",
		duration: "10 min",
		unit: "forces"
	},
	{
		id: "ramp",
		title: "Ramp Racers",
		kicker: "Design an investigation",
		blurb: "Send a car down a ramp. Change one variable at a time — height, surface, or mass — and measure how far it goes.",
		teks: ["5.7B"],
		teksPlain: "Design a simple experimental investigation that tests the effect of force on an object in a system such as a car on a ramp.",
		question: "How does changing one force in a system change how far the car travels?",
		duration: "15 min",
		unit: "forces"
	},
	{
		id: "rocket",
		title: "Balloon Rocket",
		kicker: "Force in a system",
		blurb: "Inflate a balloon on a string. Test how thrust, cargo, and string friction change the rocket’s motion.",
		teks: ["5.7B"],
		teksPlain: "Design a simple experimental investigation that tests the effect of force on an object in a system such as a balloon rocket on a string.",
		question: "What makes a balloon rocket travel farther along the string?",
		duration: "12 min",
		unit: "forces"
	},
	{
		id: "distance",
		title: "Near and Far",
		kicker: "Gravity, friction, magnets",
		blurb: "Compare forces that touch an object with forces that act at a distance: gravity, friction, and magnetism.",
		teks: ["3.7A", "4.7A"],
		teksPlain: "Describe forces in contact or at a distance, including magnetism, gravity, friction, and pushes and pulls.",
		question: "Which forces need a touch, and which can pull or push from far away?",
		duration: "12 min",
		unit: "forces"
	},
	{
		id: "canyon",
		title: "Canyon",
		kicker: "Water · erosion",
		blurb: "A river cuts a deep V-shaped canyon through rock. Faster water carves faster. Think Palo Duro Canyon in Texas.",
		teks: ["5.10C"],
		teksPlain: "Model and identify how water changes Earth’s surface to form landforms, including canyons.",
		question: "How does running water carve a canyon?",
		duration: "8 min",
		unit: "landforms"
	},
	{
		id: "valley",
		title: "U-shaped Valley",
		kicker: "Ice · erosion",
		blurb: "A glacier scrapes a V-valley into a wide U. Then melt the ice — the landform can stay after the glacier is gone.",
		teks: ["5.10C"],
		teksPlain: "Model and identify how ice changes Earth’s surface to form landforms such as U-shaped valleys.",
		question: "How does ice change a V-shaped valley into a U?",
		duration: "8 min",
		unit: "landforms"
	},
	{
		id: "delta",
		title: "Delta",
		kicker: "Water · deposition",
		blurb: "A river slows where it meets the sea and drops sediment in a triangle of new land. Texas rivers do this at the Gulf.",
		teks: ["5.10C"],
		teksPlain: "Model and identify how water deposits sediment to form landforms, including deltas.",
		question: "What happens to sediment when a river meets still water?",
		duration: "8 min",
		unit: "landforms"
	},
	{
		id: "dunes",
		title: "Sand Dunes",
		kicker: "Wind · deposition",
		blurb: "Wind hops sand up a gentle slope and dumps it on a steep slip face. The dune creeps downwind — like Monahans Sandhills.",
		teks: ["5.10C"],
		teksPlain: "Model and identify how wind changes Earth’s surface to form landforms, including sand dunes.",
		question: "How does wind build a sand dune and make it move?",
		duration: "8 min",
		unit: "landforms"
	},
	{
		id: "build",
		title: "Snap a Circuit",
		kicker: "Parts that go together",
		blurb: "Place a battery, turn the wires, add a switch, and a light, fan, or buzzer. Tap the switch to turn the path on or off.",
		teks: ["5.8B"],
		teksPlain: "Identify the requirements for a functioning electrical circuit by connecting a source, conductors, and a load.",
		question: "How do you connect the parts so electrical energy can reach a load?",
		duration: "12 min",
		unit: "circuits"
	},
	{
		id: "lightup",
		title: "Light it Up",
		kicker: "Complete circuit",
		blurb: "A battery, a switch, wires, and a bulb. Close the path to light it. Open the switch or break a wire and it goes out.",
		teks: ["5.8B"],
		teksPlain: "Identify the requirements for a functioning electrical circuit: a source, a load, and a closed path.",
		question: "What does a circuit need before the bulb will light?",
		duration: "8 min",
		unit: "circuits"
	},
	{
		id: "energy",
		title: "Energy Changes",
		kicker: "Light, motion, sound, thermal",
		blurb: "Swap the load. Electrical energy can become light, motion, sound, or thermal energy — same source, different job.",
		teks: ["5.8A", "5.8B"],
		teksPlain: "Demonstrate that electrical energy in complete circuits can be transformed into motion, light, sound, or thermal energy.",
		question: "How does electrical energy change when it reaches different loads?",
		duration: "8 min",
		unit: "circuits"
	},
	{
		id: "conduct",
		title: "Conductor or Insulator?",
		kicker: "Complete the path",
		blurb: "The circuit has a gap. Test foil, a penny, a rubber band, wood, and more. Only conductors let the bulb light.",
		teks: ["5.6A", "5.8B"],
		teksPlain: "Compare materials that conduct or insulate electric energy, and show that a circuit needs a complete conducting path.",
		question: "Which materials complete the circuit, and which block it?",
		duration: "10 min",
		unit: "circuits"
	},
	{
		id: "story",
		title: "From Rock to Rock",
		kicker: "One process at a time",
		blurb: "Weathering, erosion, deposition, compaction, and cementation. Press Play for each process. It pauses before the next one.",
		teks: ["5.10B"],
		teksPlain: "Model and describe the processes that led to the formation of sedimentary rocks.",
		question: "What happens to rock, in order, before it can become sedimentary rock?",
		duration: "12 min",
		unit: "rocks"
	},
	{
		id: "process",
		title: "Name the Process",
		kicker: "Still pictures",
		blurb: "Look at a frozen picture. Guess weathering, erosion, deposition, compaction, or cementation. Reveal when ready.",
		teks: ["5.10B"],
		teksPlain: "Model and describe the processes that led to the formation of sedimentary rocks.",
		question: "Which process does this picture show?",
		duration: "8 min",
		unit: "rocks"
	},
	{
		id: "order",
		title: "Put Them in Order",
		kicker: "Sequence",
		blurb: "Tap the five processes in the order they happen. Break, move, drop, squeeze, glue.",
		teks: ["5.10B"],
		teksPlain: "Model and describe the processes that led to the formation of sedimentary rocks.",
		question: "What is the order of processes that form sedimentary rock?",
		duration: "6 min",
		unit: "rocks"
	},
	{
		id: "fuels",
		title: "Fossil Fuels",
		kicker: "Coal, oil, gas",
		blurb: "Living things get buried in sediment. Time, heat, and pressure turn them into coal, oil, or natural gas.",
		teks: ["5.10B"],
		teksPlain: "Model and describe the processes that led to the formation of fossil fuels.",
		question: "How do fossils and fossil fuels end up in sedimentary rock?",
		duration: "8 min",
		unit: "rocks"
	}
];
var WORD_BANK = [
	{
		term: "Force",
		meaning: "A push or a pull. Forces can start, stop, or change an object’s motion.",
		units: ["forces"]
	},
	{
		term: "Equal forces",
		meaning: "Forces that are the same strength but opposite directions. They cancel. Motion does not change.",
		units: ["forces"]
	},
	{
		term: "Unequal forces",
		meaning: "One force is stronger. The object speeds up, slows down, or changes direction toward the larger force.",
		units: ["forces"]
	},
	{
		term: "Gravity",
		meaning: "A pull toward Earth. Gravity acts at a distance — no touching needed.",
		units: ["forces"]
	},
	{
		term: "Friction",
		meaning: "A force that opposes motion when two surfaces rub. Ice has little friction. Sandpaper has a lot.",
		units: ["forces"]
	},
	{
		term: "Magnetism",
		meaning: "A force from magnets. It can pull (attract) or push (repel) without touching.",
		units: ["forces"]
	},
	{
		term: "Energy transfer",
		meaning: "When a force moves an object, energy is transferred. A moving crate has energy of motion.",
		units: ["forces"]
	},
	{
		term: "Fair test",
		meaning: "Change only one thing (the independent variable). Keep everything else the same. Measure the result.",
		units: ["forces"]
	},
	{
		term: "Independent variable",
		meaning: "The one thing you change on purpose in an investigation.",
		units: ["forces"]
	},
	{
		term: "Dependent variable",
		meaning: "The thing you measure to see the effect of the change.",
		units: ["forces"]
	},
	{
		term: "Weathering",
		meaning: "Rock is broken into smaller pieces. The pieces stay in place until something carries them.",
		units: ["rocks", "landforms"]
	},
	{
		term: "Erosion",
		meaning: "Wind, water, or ice picks up weathered rock and carries it to a new place.",
		units: ["rocks", "landforms"]
	},
	{
		term: "Deposition",
		meaning: "Sediment is dropped. This builds new land, such as a delta or a sand dune.",
		units: ["rocks", "landforms"]
	},
	{
		term: "Landform",
		meaning: "A natural shape on Earth’s surface — a canyon, valley, delta, or dune.",
		units: ["landforms"]
	},
	{
		term: "Canyon",
		meaning: "A deep valley with steep rocky sides. Running water usually cuts a V-shaped canyon.",
		units: ["landforms"]
	},
	{
		term: "U-shaped valley",
		meaning: "A valley with a wide, rounded floor. Ice (a glacier) scrapes it that way. The ice can melt and the U stays.",
		units: ["landforms"]
	},
	{
		term: "Delta",
		meaning: "A triangle of new land where a river meets a lake or ocean and drops its sediment.",
		units: ["landforms"]
	},
	{
		term: "Sand dune",
		meaning: "A hill of sand built by wind. Gentle slope facing the wind, steep slip face on the other side.",
		units: ["landforms"]
	},
	{
		term: "Glacier",
		meaning: "A huge, slow river of ice. It can carve rock and carry boulders.",
		units: ["landforms"]
	},
	{
		term: "Sediment",
		meaning: "Bits of rock, sand, and mud that water, wind, or ice can carry and drop.",
		units: ["landforms", "rocks"]
	},
	{
		term: "Circuit",
		meaning: "A path that electrical energy can follow. It only works if the path is complete (closed).",
		units: ["circuits"]
	},
	{
		term: "Source",
		meaning: "Where the electrical energy comes from in a circuit — usually a battery (chemical energy).",
		units: ["circuits"]
	},
	{
		term: "Load",
		meaning: "The part that uses electrical energy and changes it into light, motion, sound, or thermal energy.",
		units: ["circuits"]
	},
	{
		term: "Switch",
		meaning: "A control that opens or closes the path. Open = off. Closed = the circuit can work.",
		units: ["circuits"]
	},
	{
		term: "Conductor",
		meaning: "A material electrical energy can pass through, such as copper, foil, or a paper clip.",
		units: ["circuits"]
	},
	{
		term: "Insulator",
		meaning: "A material that blocks electrical energy, such as rubber, wood, plastic, or yarn.",
		units: ["circuits"]
	},
	{
		term: "Energy transformation",
		meaning: "Energy changing form. In a flashlight: chemical → electrical → light.",
		units: ["circuits"]
	},
	{
		term: "Compaction",
		meaning: "Weight from new layers squeezes older sediment. The layers get thinner and tighter.",
		units: ["rocks"]
	},
	{
		term: "Cementation",
		meaning: "Minerals act like glue between grains and harden sediment into sedimentary rock.",
		units: ["rocks"]
	},
	{
		term: "Sedimentary rock",
		meaning: "Rock made from layers of sediment that were compacted and cemented. Often holds fossils.",
		units: ["rocks"]
	},
	{
		term: "Fossil fuels",
		meaning: "Coal, oil, and natural gas formed from buried remains of living things over millions of years.",
		units: ["rocks"]
	}
];
function glossaryForUnit(unit) {
	return WORD_BANK.filter((w) => w.units.includes(unit));
}
function labById(id) {
	return LABS.find((l) => l.id === id);
}
function labsForUnit(unit) {
	return LABS.filter((l) => l.unit === unit);
}
function neighbors(id) {
	const i = LABS.findIndex((l) => l.id === id);
	if (i < 0) return {};
	return {
		prev: LABS[i - 1],
		next: LABS[i + 1]
	};
}
var ITEMS = [
	{
		unit: "forces",
		label: "Forces",
		icon: FlaskConical
	},
	{
		unit: "landforms",
		label: "Landforms",
		icon: Mountain
	},
	{
		unit: "circuits",
		label: "Circuits",
		icon: Zap
	},
	{
		unit: "rocks",
		label: "Rocks",
		icon: Layers
	}
];
function ScienceShell({ children, className }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const labMatch = pathname.match(/\/science\/lab\/([^/]+)/);
	const currentLab = labMatch ? labById(labMatch[1] ?? "") : void 0;
	const currentUnit = pathname.match(/\/science\/labs\/([^/]+)/)?.[1] ?? currentLab?.unit;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		className,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "-mx-4 -mt-6 mb-6 border-b border-line sm:-mt-8",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex max-w-5xl flex-wrap items-center gap-0.5 px-4 py-1.5",
				children: [
					ITEMS.map((item) => {
						const Icon = item.icon;
						const on = currentUnit === item.unit;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/science/labs/$unit",
							params: { unit: item.unit },
							className: cn("inline-flex h-10 items-center gap-1.5 rounded-md px-2.5 text-sm no-underline", on ? "bg-paper text-forest" : "text-muted hover:bg-paper hover:text-ink"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-3.5" }), item.label]
						}, item.unit);
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mx-1 hidden h-4 w-px bg-line sm:block" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/science/notebook",
						className: cn("inline-flex h-10 items-center gap-1.5 rounded-md px-2.5 text-sm no-underline", pathname.includes("/notebook") ? "bg-paper text-forest" : "text-muted hover:bg-paper hover:text-ink"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "size-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden sm:inline",
							children: "Notebook"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/science/quiz",
						className: cn("inline-flex h-10 items-center gap-1.5 rounded-md px-2.5 text-sm no-underline", pathname.includes("/quiz") ? "bg-paper text-forest" : "text-muted hover:bg-paper hover:text-ink"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardCheck, { className: "size-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden sm:inline",
							children: "Check it"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/science/teacher",
						className: cn("inline-flex h-10 items-center gap-1.5 rounded-md px-2.5 text-sm no-underline", pathname.includes("/teacher") ? "bg-paper text-forest" : "text-muted hover:bg-paper hover:text-ink"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraduationCap, { className: "size-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden sm:inline",
							children: "Teachers"
						})]
					})
				]
			})
		}), children]
	});
}
//#endregion
export { glossaryForUnit as a, labsForUnit as c, WORD_BANK as i, neighbors as l, LAB_UNITS as n, isLabUnit as o, ScienceShell as r, labById as s, LABS as t };
