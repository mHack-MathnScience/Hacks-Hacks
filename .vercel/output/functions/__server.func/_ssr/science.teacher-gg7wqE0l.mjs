import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as Badge } from "./badge-Gu7_XEK4.mjs";
import { r as ScienceShell, t as LABS } from "./science-shell-Ba2jLADM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/science.teacher-gg7wqE0l.js
var import_jsx_runtime = require_jsx_runtime();
var TEKS_ROWS = [
	{
		teks: "5.7A",
		expectation: "Investigate and explain how equal and unequal forces acting on an object cause patterns of motion and transfer of energy.",
		labs: "Equal or Unequal?"
	},
	{
		teks: "5.7B",
		expectation: "Design a simple experimental investigation that tests the effect of force on an object in a system such as a car on a ramp or balloon rocket on a string.",
		labs: "Ramp Racers, Balloon Rocket"
	},
	{
		teks: "3.7A",
		expectation: "Demonstrate and describe forces acting on an object in contact or at a distance, including magnetism, gravity, and pushes and pulls. (spiraled)",
		labs: "Near and Far"
	},
	{
		teks: "4.7A",
		expectation: "Plan and conduct descriptive investigations of patterns of forces such as gravity, friction, or magnetism in contact or at a distance. (spiraled)",
		labs: "Near and Far, Ramp Racers"
	},
	{
		teks: "5.10C",
		expectation: "Model and identify how changes to Earth’s surface by wind, water, or ice result in the formation of landforms, including deltas, canyons, and sand dunes. U-shaped valleys are the ice example (TEKS Guide).",
		labs: "Canyon, U-shaped Valley, Delta, Sand Dunes"
	},
	{
		teks: "4.10B",
		expectation: "Model and describe slow changes to Earth’s surface caused by weathering, erosion, and deposition from water, wind, and ice. (spiraled)",
		labs: "All four landform labs"
	},
	{
		teks: "5.8B",
		expectation: "Demonstrate that electrical energy in complete circuits can be transformed into motion, light, sound, or thermal energy and identify the requirements for a functioning electrical circuit.",
		labs: "Snap a Circuit, Light it Up, Energy Changes, Conductor or Insulator"
	},
	{
		teks: "5.8A",
		expectation: "Investigate and describe the transformation of energy in systems such as energy in a flashlight battery that changes from chemical energy to electrical energy to light energy.",
		labs: "Energy Changes"
	},
	{
		teks: "5.6A",
		expectation: "Compare and contrast matter based on measurable, testable, or observable physical properties, including the ability to conduct or insulate thermal energy and electric energy. (electric energy focus)",
		labs: "Conductor or Insulator"
	},
	{
		teks: "5.10B",
		expectation: "Model and describe the processes that led to the formation of sedimentary rocks and fossil fuels.",
		labs: "From Rock to Rock, Name the Process, Put Them in Order, Fossil Fuels"
	}
];
var LESSON_PATHS = [
	{
		title: "45-minute path (Forces)",
		steps: [
			{
				time: "0–8 min · Engage",
				name: "Equal or Unequal",
				body: "Students predict what happens when both sliders match, then when one is larger. Name the words equal, unequal, and energy of motion."
			},
			{
				time: "8–22 min · Explore",
				name: "Ramp Racers",
				body: "Each pair changes only one variable (height, surface, or mass) and records three trials. Keep the other variables the same — that is a fair test."
			},
			{
				time: "22–34 min · Explain",
				name: "Near and Far",
				body: "Drop on Earth vs. space, push on ice vs. sandpaper, then attract and repel magnets. Sort forces: contact vs. at a distance; push, pull, or both."
			},
			{
				time: "34–42 min · Evaluate",
				name: "Check-it quiz",
				body: "Review missed items with the explanation under each question."
			},
			{
				time: "42–45 min · Elaborate",
				name: "Notebook",
				body: "One Claim–Evidence–Reasoning: “Unequal forces change motion.”"
			}
		]
	},
	{
		title: "35-minute landform path",
		steps: [
			{
				time: "0–8 min",
				name: "Canyon (water, erosion)",
				body: "Play time. Compare a trickle vs. fast water. Name V-shape. Texas: Palo Duro Canyon."
			},
			{
				time: "8–16 min",
				name: "U-shaped valley (ice, erosion)",
				body: "Add the glacier, let it scrape, then melt. The U stays — the agent can be gone."
			},
			{
				time: "16–24 min",
				name: "Delta (water, deposition)",
				body: "Turn sediment up. The river slows at the sea and drops a triangle of new land."
			},
			{
				time: "24–32 min",
				name: "Sand dunes (wind)",
				body: "Wind hops sand up the gentle slope and dumps it on the slip face. Texas: Monahans Sandhills."
			},
			{
				time: "32–35 min",
				name: "Sort",
				body: "Agent (wind, water, ice) × process (erosion or deposition) × landform. Then 5.10C items on Check-it."
			}
		]
	},
	{
		title: "Circuit path",
		steps: [
			{
				time: "0–8 min",
				name: "Snap a Circuit",
				body: "Parts have to go together. Place a battery, rotate wires and corners, add a light. Open vs closed path."
			},
			{
				time: "8–14 min",
				name: "Light it Up",
				body: "Name source, load, and path. Close the switch. Then break a wire. A circuit works only when the path is complete."
			},
			{
				time: "14–20 min",
				name: "Energy Changes",
				body: "Same battery, four loads: bulb (light), fan (motion), buzzer (sound), coil (thermal). Trace chemical → electrical → ____."
			},
			{
				time: "20–28 min",
				name: "Conductor or Insulator",
				body: "Test six materials in the gap. Metals and pencil lead usually conduct. Rubber, wood, plastic, and yarn insulate."
			}
		]
	},
	{
		title: "30-minute rock path",
		steps: [
			{
				time: "0–12 min",
				name: "From Rock to Rock",
				body: "Start still. Play weathering (bits stay). Play erosion (bits move). Play deposition (layers). Play compaction (squeeze). Play cementation (glue → sedimentary rock)."
			},
			{
				time: "12–18 min",
				name: "Name the Process",
				body: "Still pictures. Students whisper the word. Then Reveal. Next waits for you."
			},
			{
				time: "18–24 min",
				name: "Put Them in Order",
				body: "Break, move, drop, squeeze, glue. Weathering → erosion → deposition → compaction → cementation."
			},
			{
				time: "24–30 min",
				name: "Fossil Fuels",
				body: "Next through living things, burial, heat and pressure, then coal, oil, and natural gas in sedimentary layers. Check-it items q18–q21."
			}
		]
	}
];
var MISCONCEPTIONS = [
	{
		myth: "If it isn’t moving, there are no forces.",
		truth: "Equal forces can cancel. A still crate can have two strong pushes."
	},
	{
		myth: "Heavier things fall faster.",
		truth: "Drop the light and heavy balls on Earth — they land together. Gravity pulls both down."
	},
	{
		myth: "Weathering and erosion are the same.",
		truth: "Weathering breaks. Erosion moves. If the bits stay at the cliff, it is still weathering."
	},
	{
		myth: "If there is no glacier now, ice did not form this valley.",
		truth: "The agent may be gone. The U shape is the evidence."
	},
	{
		myth: "Deltas and dunes are erosion.",
		truth: "Both involve moving sediment, but the landform is built by deposition — dropping sediment."
	},
	{
		myth: "If it has a battery, it will work.",
		truth: "The path must be closed and made of conductors. An open switch or an insulator stops the load."
	}
];
function TeacherPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ScienceShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-medium tracking-[0.16em] text-forest uppercase",
			children: "For teachers"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mt-1 font-display text-4xl font-semibold tracking-tight",
			children: "Science Hacks · Texas Grade 5"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 max-w-2xl text-ink-soft",
			children: "Aligned to the science TEKS implemented in 2024 (assessed on STAAR Elementary Science from 2025–2026). Four units: forces (5.7), landforms (5.10C), circuits (5.8B / 5.8A), and sedimentary rock (5.10B). Students never see Newton’s laws by name."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl font-semibold",
				children: "Standards"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[36rem] text-left text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-line text-xs tracking-wide text-muted uppercase",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 pr-3",
								children: "TEKS"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 pr-3",
								children: "Student expectation"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2",
								children: "Lab"
							})
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: TEKS_ROWS.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-line align-top",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-3 pr-3 font-medium text-forest",
								children: row.teks
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-3 pr-3 text-ink-soft",
								children: row.expectation
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-3 text-ink",
								children: row.labs
							})
						]
					}, row.teks)) })]
				})
			})]
		}),
		LESSON_PATHS.map((path) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl font-semibold",
				children: path.title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "mt-4 space-y-4",
				children: path.steps.map((step) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-xl border border-line bg-surface px-4 py-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs tracking-wide text-muted uppercase",
							children: step.time
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 font-medium",
							children: step.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-ink-soft",
							children: step.body
						})
					]
				}, step.name))
			})]
		}, path.title)),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl font-semibold",
				children: "Watch for these ideas"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 space-y-3",
				children: MISCONCEPTIONS.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-xl border border-line bg-surface px-4 py-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm font-medium",
						children: [
							"“",
							m.myth,
							"”"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-ink-soft",
						children: m.truth
					})]
				}, m.myth))
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl font-semibold",
				children: "Labs at a glance"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 grid gap-3 sm:grid-cols-2",
				children: LABS.map((lab) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/science/lab/$labId",
					params: { labId: lab.id },
					className: "block no-underline",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "h-full rounded-xl border border-line bg-surface px-4 py-4 transition-[border-color] hover:border-line-strong",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-1.5",
								children: lab.teks.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: t }, t))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 font-display text-lg font-medium",
								children: lab.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-sm text-muted",
								children: [
									lab.duration,
									" · ",
									lab.question
								]
							})
						]
					})
				}, lab.id))
			})]
		})
	] });
}
//#endregion
export { TeacherPage as component };
