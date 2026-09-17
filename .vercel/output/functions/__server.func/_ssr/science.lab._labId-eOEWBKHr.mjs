import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { _ as ArrowLeft, f as Check, g as ArrowRight } from "../_libs/lucide-react.mjs";
import { r as cn } from "./app-shell-Dqa0Wea-.mjs";
import { n as CardContent, t as Card } from "./card-Clcq4lIV.mjs";
import { t as Badge } from "./badge-Gu7_XEK4.mjs";
import { a as Route$3 } from "./router-B5VgnKaN.mjs";
import { t as Button } from "./button-CwfzykdW.mjs";
import { l as neighbors, n as LAB_UNITS, r as ScienceShell, s as labById } from "./science-shell-Ba2jLADM.mjs";
import { n as labRecord, r as useLabStore } from "./lab-store-D1m1ljYL.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/science.lab._labId-eOEWBKHr.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LabFrame({ lab, children }) {
	const byLab = useLabStore((s) => s.byLab);
	const rec = labRecord(byLab, lab.id);
	const saveClaim = useLabStore((s) => s.saveClaim);
	const markFinished = useLabStore((s) => s.markFinished);
	const [claim, setClaim] = (0, import_react.useState)("");
	const [mounted, setMounted] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setMounted(true);
		setClaim(useLabStore.getState().byLab[lab.id]?.claim ?? "");
	}, [lab.id]);
	const { prev, next } = neighbors(lab.id);
	const done = mounted && rec.finished;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: "/science/labs/$unit",
			params: { unit: lab.unit },
			className: "mb-5 inline-flex items-center gap-1.5 text-sm text-muted no-underline hover:text-ink",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), LAB_UNITS.find((u) => u.id === lab.unit)?.title ?? "Labs"]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-medium tracking-[0.16em] text-forest uppercase",
			children: lab.kicker
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mt-1 font-display text-3xl font-semibold tracking-tight",
			children: lab.title
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 max-w-2xl text-ink-soft",
			children: lab.teksPlain
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-2 flex flex-wrap gap-1.5",
			children: [
				lab.teks.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: t }, t)),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs text-faint",
					children: lab.duration
				}),
				done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "readiness",
					className: "normal-case tracking-normal",
					children: "Finished"
				}) : null
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-4 text-sm text-ink",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-medium",
				children: "Investigate: "
			}), lab.question]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-6",
			children
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "mt-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						htmlFor: "claim",
						className: "text-xs font-medium tracking-wide text-muted uppercase",
						children: "Claim — evidence — reasoning"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						id: "claim",
						value: mounted ? claim : "",
						onChange: (e) => setClaim(e.target.value),
						rows: 3,
						placeholder: "I think… because in the lab I saw…",
						className: "mt-2 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus-visible:outline-2 focus-visible:outline-forest"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							onClick: () => saveClaim(lab.id, claim),
							children: "Save claim"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: () => markFinished(lab.id),
							disabled: done,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" }), done ? "Finished" : "Mark finished"]
						})]
					})
				]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 flex flex-wrap justify-between gap-2",
			children: [prev ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				variant: "secondary",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/science/lab/$labId",
					params: { labId: prev.id },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), prev.title]
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}), next ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/science/lab/$labId",
					params: { labId: next.id },
					children: [
						"Next: ",
						next.title,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })
					]
				})
			}) : null]
		})
	] });
}
function Stage({ children, className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("overflow-hidden rounded-xl border border-line bg-paper", className),
		children
	});
}
function ChallengeList({ items }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
		className: "mt-5 space-y-1.5 text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
			className: "text-xs font-medium tracking-wide text-muted uppercase",
			children: "Challenges"
		}), items.map((it) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "flex gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: it.ok ? "text-good" : "text-faint",
				"aria-hidden": true,
				children: it.ok ? "✓" : "○"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: it.ok ? "text-ink" : "text-muted",
				children: it.text
			})]
		}, it.text))]
	});
}
var COLS = 6;
var ROWS = 4;
var N = 24;
var PARTS = [
	{
		id: "battery",
		label: "Battery"
	},
	{
		id: "wire",
		label: "Wire"
	},
	{
		id: "corner",
		label: "Corner"
	},
	{
		id: "switch",
		label: "Switch"
	},
	{
		id: "light",
		label: "Light"
	},
	{
		id: "fan",
		label: "Fan"
	},
	{
		id: "buzzer",
		label: "Buzzer"
	}
];
var DIRS = [
	"n",
	"e",
	"s",
	"w"
];
function opposite(d) {
	if (d === "n") return "s";
	if (d === "s") return "n";
	if (d === "e") return "w";
	return "e";
}
function step(r, c, d) {
	if (d === "n") return {
		r: r - 1,
		c
	};
	if (d === "s") return {
		r: r + 1,
		c
	};
	if (d === "w") return {
		r,
		c: c - 1
	};
	return {
		r,
		c: c + 1
	};
}
function idx(r, c) {
	return r * COLS + c;
}
function portsOf(cell) {
	if (cell.part === "corner") return [
		["n", "e"],
		["e", "s"],
		["s", "w"],
		["w", "n"]
	][cell.rot];
	return cell.rot % 2 === 0 ? ["w", "e"] : ["n", "s"];
}
function conducts(cell) {
	if (!cell) return false;
	if (cell.part === "switch") return cell.closed;
	return true;
}
function neighborThrough(grid, r, c, d) {
	const cell = grid[idx(r, c)];
	if (!conducts(cell) || !portsOf(cell).includes(d)) return null;
	const n = step(r, c, d);
	if (n.r < 0 || n.r >= ROWS || n.c < 0 || n.c >= COLS) return null;
	const other = grid[idx(n.r, n.c)];
	if (!conducts(other) || !portsOf(other).includes(opposite(d))) return null;
	return n;
}
function analyze(grid) {
	const batteries = [];
	const loads = [];
	for (let i = 0; i < grid.length; i++) {
		const p = grid[i]?.part;
		if (p === "battery") batteries.push(i);
		if (p === "light" || p === "fan" || p === "buzzer") loads.push(i);
	}
	if (!batteries.length) return {
		powered: /* @__PURE__ */ new Set(),
		status: "Add a battery — that is the source."
	};
	const b = batteries[0];
	const br = Math.floor(b / COLS);
	const bc = b % COLS;
	const bcell = grid[b];
	const terms = [];
	for (const d of portsOf(bcell)) {
		const n = neighborThrough(grid, br, bc, d);
		if (n) terms.push(idx(n.r, n.c));
	}
	if (terms.length < 2) return {
		powered: /* @__PURE__ */ new Set(),
		status: "Both ends of the battery need to touch a path."
	};
	const adj = /* @__PURE__ */ new Map();
	const add = (a, b2) => {
		const list = adj.get(a) ?? [];
		list.push(b2);
		adj.set(a, list);
	};
	for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
		const i = idx(r, c);
		const cell = grid[i];
		if (!conducts(cell) || cell.part === "battery") continue;
		for (const d of DIRS) {
			const n = neighborThrough(grid, r, c, d);
			if (!n) continue;
			const j = idx(n.r, n.c);
			if (grid[j]?.part === "battery") continue;
			add(i, j);
		}
	}
	const seen = /* @__PURE__ */ new Set();
	const stack = [terms[0]];
	while (stack.length) {
		const i = stack.pop();
		if (seen.has(i)) continue;
		seen.add(i);
		for (const j of adj.get(i) ?? []) stack.push(j);
	}
	if (!seen.has(terms[1])) return {
		powered: /* @__PURE__ */ new Set(),
		status: "Open path. Rotate wires so they touch, or close the switch."
	};
	const powered = /* @__PURE__ */ new Set();
	for (const li of loads) if (seen.has(li)) powered.add(li);
	if (!powered.size) return {
		powered,
		status: "The path is closed, but there is no load on it. Add a light, fan, or buzzer."
	};
	const names = [...powered].map((i) => grid[i].part);
	const bits = [];
	if (names.includes("light")) bits.push("the light is on");
	if (names.includes("fan")) bits.push("the fan is spinning");
	if (names.includes("buzzer")) bits.push("the buzzer sounds");
	return {
		powered,
		status: `Complete path — ${bits.join(", ")}.`
	};
}
function CellGlyph({ cell, on }) {
	const stroke = "var(--color-ink)";
	const live = on ? "var(--color-forest)" : "var(--color-line-strong)";
	const rot = cell.part === "corner" ? cell.rot * 90 : cell.rot % 2 * 90;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 32 32",
		className: "h-full w-full",
		"aria-hidden": true,
		children: [
			cell.part === "battery" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
				transform: `rotate(${rot} 16 16)`,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: "6",
						y: "11",
						width: "20",
						height: "10",
						rx: "2",
						fill: "var(--color-forest)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
						x: "10",
						y: "19",
						fontSize: "8",
						fill: "var(--color-bg)",
						children: "+"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
						x: "20",
						y: "19",
						fontSize: "8",
						fill: "var(--color-bg)",
						children: "−"
					})
				]
			}) : null,
			cell.part === "wire" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
				transform: `rotate(${rot} 16 16)`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: "2",
					y1: "16",
					x2: "30",
					y2: "16",
					stroke: live,
					strokeWidth: "3",
					strokeLinecap: "round"
				})
			}) : null,
			cell.part === "corner" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
				transform: `rotate(${rot} 16 16)`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M16 2 V16 H30",
					fill: "none",
					stroke: live,
					strokeWidth: "3",
					strokeLinecap: "round"
				})
			}) : null,
			cell.part === "switch" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
				transform: `rotate(${rot} 16 16)`,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: "2",
						y1: "16",
						x2: "12",
						y2: "16",
						stroke: live,
						strokeWidth: "3",
						strokeLinecap: "round"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: "20",
						y1: "16",
						x2: "30",
						y2: "16",
						stroke: live,
						strokeWidth: "3",
						strokeLinecap: "round"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: "12",
						y1: "16",
						x2: "20",
						y2: cell.closed ? 16 : 8,
						stroke,
						strokeWidth: "2.5",
						strokeLinecap: "round"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: "12",
						cy: "16",
						r: "1.6",
						fill: stroke
					})
				]
			}) : null,
			cell.part === "light" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
				transform: `rotate(${rot} 16 16)`,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: "2",
						y1: "16",
						x2: "10",
						y2: "16",
						stroke: live,
						strokeWidth: "3"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: "22",
						y1: "16",
						x2: "30",
						y2: "16",
						stroke: live,
						strokeWidth: "3"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: "16",
						cy: "16",
						r: "7",
						fill: on ? "var(--color-chalk)" : "var(--color-paper)",
						stroke: live,
						strokeWidth: "2"
					}),
					on ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: "16",
						cy: "16",
						r: "3",
						fill: "var(--color-forest)"
					}) : null
				]
			}) : null,
			cell.part === "fan" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
				transform: `rotate(${rot} 16 16)`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: "2",
					y1: "16",
					x2: "10",
					y2: "16",
					stroke: live,
					strokeWidth: "3"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: "22",
					y1: "16",
					x2: "30",
					y2: "16",
					stroke: live,
					strokeWidth: "3"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
				className: on ? "fan-spin" : void 0,
				style: { transformOrigin: "16px 16px" },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "16",
					cy: "16",
					r: "2.2",
					fill: live
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M16 16 L16 7 Q20 10 16 16 L25 16 Q22 20 16 16 L16 25 Q12 22 16 16 L7 16 Q10 12 16 16",
					fill: live,
					opacity: "0.85"
				})]
			})] }) : null,
			cell.part === "buzzer" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
					transform: `rotate(${rot} 16 16)`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: "2",
						y1: "16",
						x2: "10",
						y2: "16",
						stroke: live,
						strokeWidth: "3"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: "22",
						y1: "16",
						x2: "30",
						y2: "16",
						stroke: live,
						strokeWidth: "3"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: "11",
					y: "11",
					width: "10",
					height: "10",
					rx: "2",
					fill: on ? "var(--color-forest)" : "var(--color-paper)",
					stroke: live,
					strokeWidth: "1.5"
				}),
				on ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M22 12 Q26 16 22 20",
					fill: "none",
					stroke: "var(--color-forest)",
					strokeWidth: "1.5",
					className: "buzzer-ping"
				}) : null
			] }) : null
		]
	});
}
function BuildLab() {
	const [grid, setGrid] = (0, import_react.useState)(() => Array(N).fill(null));
	const [tool, setTool] = (0, import_react.useState)("battery");
	const [focus, setFocus] = (0, import_react.useState)(null);
	const [rotated, setRotated] = (0, import_react.useState)(false);
	const [switchedOff, setSwitchedOff] = (0, import_react.useState)(false);
	const [switchedOn, setSwitchedOn] = (0, import_react.useState)(false);
	const result = (0, import_react.useMemo)(() => analyze(grid), [grid]);
	function place(i) {
		setFocus(i);
		const cur = grid[i];
		if (tool === "remove") {
			setGrid((prev) => {
				const next = [...prev];
				next[i] = null;
				return next;
			});
			return;
		}
		if (!cur && tool) {
			setGrid((prev) => {
				const next = [...prev];
				next[i] = {
					part: tool,
					rot: 0,
					closed: true
				};
				return next;
			});
			return;
		}
		if (cur && tool && tool !== cur.part) {
			setGrid((prev) => {
				const next = [...prev];
				next[i] = {
					part: tool,
					rot: 0,
					closed: true
				};
				return next;
			});
			return;
		}
		if (cur?.part === "switch") {
			const closed = !cur.closed;
			if (result.powered.size > 0 && !closed) setSwitchedOff(true);
			if (closed) setSwitchedOn(true);
			setGrid((prev) => {
				const next = [...prev];
				const cell = next[i];
				if (cell?.part === "switch") next[i] = {
					...cell,
					closed
				};
				return next;
			});
			return;
		}
		if (cur && tool === cur.part) {
			setRotated(true);
			setGrid((prev) => {
				const next = [...prev];
				const cell = next[i];
				if (!cell) return prev;
				next[i] = {
					...cell,
					rot: (cell.rot + 1) % 4
				};
				return next;
			});
		}
	}
	function rotateFocus() {
		if (focus == null || !grid[focus]) return;
		setRotated(true);
		setGrid((prev) => {
			const next = [...prev];
			const cell = next[focus];
			if (!cell) return prev;
			next[focus] = {
				...cell,
				rot: (cell.rot + 1) % 4
			};
			return next;
		});
	}
	const hasLight = [...result.powered].some((i) => grid[i]?.part === "light");
	const hasFan = [...result.powered].some((i) => grid[i]?.part === "fan");
	const hasBuzz = [...result.powered].some((i) => grid[i]?.part === "buzzer");
	const hasSwitch = grid.some((c) => c?.part === "switch");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-3 text-sm text-muted",
			children: "Tap a part, then tap a square. Tap a used square with the same part to rotate it. Tap a switch to open or close the path."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-3 flex flex-wrap gap-1.5",
			children: [PARTS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: tool === p.id ? "default" : "secondary",
				onClick: () => setTool(p.id),
				children: p.label
			}, p.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: tool === "remove" ? "default" : "secondary",
				onClick: () => setTool("remove"),
				children: "Remove"
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stage, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-6 gap-1 p-2 sm:p-3",
			children: grid.map((cell, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": cell ? `${cell.part}${cell.part === "switch" ? cell.closed ? " closed" : " open" : ""}` : "empty square",
				onClick: () => place(i),
				className: cn("aspect-square rounded-md border bg-surface p-0.5", cell ? "border-line-strong" : "border-dashed border-line", result.powered.has(i) && "border-forest bg-forest-soft"),
				children: cell ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CellGlyph, {
					cell,
					on: result.powered.has(i)
				}) : null
			}, i))
		}) }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-sm text-ink-soft",
			children: result.status
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3 flex flex-wrap gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				onClick: rotateFocus,
				disabled: focus == null || !grid[focus ?? -1],
				children: "Rotate"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				onClick: () => setGrid(Array(N).fill(null)),
				children: "Reset"
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
			className: "mt-5 space-y-1.5 text-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-wide text-muted uppercase",
					children: "Challenges"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Challenge, {
					ok: hasLight,
					text: "Connect a battery, wires, and a light so it turns on."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Challenge, {
					ok: rotated,
					text: "Rotate a wire or corner to complete a path."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Challenge, {
					ok: hasFan,
					text: "Power a fan so it spins."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Challenge, {
					ok: hasBuzz,
					text: "Power a buzzer so it makes sound."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Challenge, {
					ok: hasSwitch && switchedOff && switchedOn,
					text: "Put a switch in the path. Tap it off, then on."
				})
			]
		})
	] });
}
function Challenge({ ok, text }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "flex gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: ok ? "text-good" : "text-faint",
			"aria-hidden": true,
			children: ok ? "✓" : "○"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: ok ? "text-ink" : "text-muted",
			children: text
		})]
	});
}
var EMPTY_TRIALS = [];
function LabSim({ id }) {
	switch (id) {
		case "equal": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EqualLab, {});
		case "ramp": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RampLab, {});
		case "rocket": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RocketLab, {});
		case "distance": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DistanceLab, {});
		case "canyon": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CanyonLab, {});
		case "valley": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ValleyLab, {});
		case "delta": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeltaLab, {});
		case "dunes": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DunesLab, {});
		case "build": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BuildLab, {});
		case "lightup": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LightupLab, {});
		case "energy": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EnergyLab, {});
		case "conduct": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConductLab, {});
		case "story": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoryLab, {});
		case "process": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProcessLab, {});
		case "order": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrderLab, {});
		case "fuels": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FuelsLab, {});
		default: return null;
	}
}
function EqualLab() {
	const [left, setLeft] = (0, import_react.useState)(4);
	const [right, setRight] = (0, import_react.useState)(4);
	const [paused, setPaused] = (0, import_react.useState)(false);
	const [x, setX] = (0, import_react.useState)(50);
	const [v, setV] = (0, import_react.useState)(0);
	const [ch, setCh] = (0, import_react.useState)({
		still: false,
		accelRight: false,
		slow: false
	});
	const leftRef = (0, import_react.useRef)(left);
	const rightRef = (0, import_react.useRef)(right);
	const pausedRef = (0, import_react.useRef)(paused);
	const vRef = (0, import_react.useRef)(v);
	const xRef = (0, import_react.useRef)(x);
	leftRef.current = left;
	rightRef.current = right;
	pausedRef.current = paused;
	vRef.current = v;
	xRef.current = x;
	(0, import_react.useEffect)(() => {
		let frame = 0;
		let last = performance.now();
		const loop = (t) => {
			const dt = Math.min(.05, (t - last) / 1e3);
			last = t;
			if (!pausedRef.current) {
				const net = rightRef.current - leftRef.current;
				let nv = vRef.current + net * 18 * dt;
				let nx = xRef.current + nv * dt;
				if (nx < 8) {
					nx = 8;
					nv = 0;
				}
				if (nx > 92) {
					nx = 92;
					nv = 0;
				}
				const prevAbs = Math.abs(vRef.current);
				vRef.current = nv;
				xRef.current = nx;
				setV(nv);
				setX(nx);
				setCh((c) => {
					let still = c.still;
					let accelRight = c.accelRight;
					let slow = c.slow;
					if (net === 0 && leftRef.current >= 7 && Math.abs(nv) < .4) still = true;
					if (net > 0 && nv > 12) accelRight = true;
					const movingSign = Math.sign(vRef.current || nv);
					if (prevAbs > 18 && net !== 0 && Math.sign(net) !== movingSign && Math.abs(nv) < prevAbs) slow = true;
					if (still === c.still && accelRight === c.accelRight && slow === c.slow) return c;
					return {
						still,
						accelRight,
						slow
					};
				});
			}
			frame = requestAnimationFrame(loop);
		};
		frame = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(frame);
	}, []);
	const net = right - left;
	const equal = net === 0;
	const speed = Math.abs(v) / 20;
	const energy = Math.min(100, v * v / 8);
	function reset() {
		setX(50);
		setV(0);
		vRef.current = 0;
		xRef.current = 50;
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stage, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			viewBox: "0 0 400 170",
			className: "h-auto w-full",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: "0",
					y: "128",
					width: "400",
					height: "42",
					fill: "var(--color-line)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: "0",
					y: "124",
					width: "400",
					height: "6",
					fill: "var(--color-line-strong)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
					transform: `translate(${x / 100 * 320 + 12} 0)`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
							x: "0",
							y: "86",
							width: "56",
							height: "38",
							rx: "4",
							fill: "var(--color-forest)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
							x: "28",
							y: "110",
							textAnchor: "middle",
							fill: "var(--color-bg)",
							fontSize: "11",
							children: "crate"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
							x1: "0",
							y1: "105",
							x2: -8 - left * 5,
							y2: "105",
							stroke: "var(--color-bad)",
							strokeWidth: "5",
							strokeLinecap: "round"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
							points: `${-8 - left * 5},105 ${-left * 5},99 ${-left * 5},111`,
							fill: "var(--color-bad)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
							x1: "56",
							y1: "105",
							x2: 64 + right * 5,
							y2: "105",
							stroke: "var(--color-forest)",
							strokeWidth: "5",
							strokeLinecap: "round"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
							points: `${64 + right * 5},105 ${56 + right * 5},99 ${56 + right * 5},111`,
							fill: "var(--color-forest)"
						})
					]
				})
			]
		}) }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-4 sm:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "text-sm",
				children: [
					"Push from the left: ",
					left,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "range",
						min: 0,
						max: 10,
						value: left,
						onChange: (e) => setLeft(Number(e.target.value)),
						className: "mt-1 w-full accent-forest"
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "text-sm",
				children: [
					"Push from the right: ",
					right,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "range",
						min: 0,
						max: 10,
						value: right,
						onChange: (e) => setRight(Number(e.target.value)),
						className: "mt-1 w-full accent-forest"
					})
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-3 text-sm text-ink-soft",
			children: [
				"Net push: ",
				net === 0 ? "0 (equal)" : `${net > 0 ? "right" : "left"} by ${Math.abs(net)}`,
				". Speed ",
				speed.toFixed(1),
				" ",
				"m/s."
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-ink",
			children: equal ? "Equal forces. The crate’s motion does not change." : "Unequal forces. Energy of motion changes toward the larger push."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs tracking-wide text-muted uppercase",
				children: "Energy of motion"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1 h-3 overflow-hidden rounded-full bg-paper",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-full bg-forest transition-[width] duration-150",
					style: { width: `${energy}%` }
				})
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3 flex flex-wrap gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				onClick: reset,
				children: "Reset crate"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				onClick: () => setPaused((p) => !p),
				children: paused ? "Play" : "Pause"
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChallengeList, { items: [
			{
				ok: ch.still,
				text: "Keep a still crate still using two strong pushes."
			},
			{
				ok: ch.accelRight,
				text: "Make the crate speed up to the right."
			},
			{
				ok: ch.slow,
				text: "Get the crate moving, then slow it with an opposite force."
			}
		] })
	] });
}
function RampLab() {
	const addTrial = useLabStore((s) => s.addTrial);
	const trials = useLabStore((s) => s.byLab.ramp?.trials) ?? EMPTY_TRIALS;
	const [change, setChange] = (0, import_react.useState)("height");
	const [height, setHeight] = (0, import_react.useState)(2);
	const [surface, setSurface] = (0, import_react.useState)("wood");
	const [mass, setMass] = (0, import_react.useState)("medium");
	const [running, setRunning] = (0, import_react.useState)(false);
	const [car, setCar] = (0, import_react.useState)(0);
	const [dist, setDist] = (0, import_react.useState)(null);
	const friction = {
		ice: .18,
		wood: .48,
		carpet: .78,
		sandpaper: .95
	}[surface];
	const m = {
		light: 1,
		medium: 2,
		heavy: 3
	}[mass];
	const predicted = Math.max(.2, Math.round(height * 2.4 / (friction * (.55 + m * .22)) * 10) / 10);
	function run() {
		const d = Math.max(.2, Math.round((predicted + (Math.random() - .5) * .4) * 10) / 10);
		setRunning(true);
		setDist(null);
		setCar(0);
		window.setTimeout(() => setCar(1), 40);
		window.setTimeout(() => {
			setDist(d);
			setRunning(false);
			addTrial("ramp", {
				height,
				surface,
				mass,
				changed: change,
				m: d
			});
		}, 850);
	}
	const maxBar = Math.max(1, ...trials.map((t) => Number(t.m) || 0));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stage, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			viewBox: "0 0 400 160",
			className: "h-auto w-full",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
					points: `18,138 18,${138 - height * 28} ${90 + height * 22},138`,
					fill: "var(--color-line-strong)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: "18",
					y: "138",
					width: "364",
					height: "8",
					fill: "var(--color-line)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: running || dist != null ? 24 + (dist ? Math.min(300, dist / 6 * 260) : car * 70) : 24,
					y: dist != null || running ? 126 : 126 - height * 28,
					width: "26",
					height: "12",
					rx: "2",
					fill: "var(--color-forest)",
					style: { transition: "x 0.8s ease-out, y 0.8s ease-out" }
				}),
				dist != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("text", {
					x: "200",
					y: "36",
					textAnchor: "middle",
					fill: "var(--color-ink)",
					fontSize: "16",
					children: [dist.toFixed(1), " m past the ramp"]
				}) : null
			]
		}) }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-sm text-muted",
			children: "I will change only one thing. Keep the other two the same. That is a fair test."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3 grid gap-3 sm:grid-cols-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "text-sm",
					children: ["Independent variable", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: "mt-1 w-full rounded-md border border-line bg-surface px-2 py-2",
						value: change,
						onChange: (e) => setChange(e.target.value),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "height",
								children: "Ramp height"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "surface",
								children: "Floor surface"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "mass",
								children: "Car mass"
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "text-sm",
					children: ["Ramp height", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: "mt-1 w-full rounded-md border border-line bg-surface px-2 py-2 disabled:opacity-50",
						value: height,
						disabled: change !== "height",
						onChange: (e) => setHeight(Number(e.target.value)),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: 1,
								children: "Low"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: 2,
								children: "Medium"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: 3,
								children: "High"
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "text-sm",
					children: ["Floor surface", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: "mt-1 w-full rounded-md border border-line bg-surface px-2 py-2 disabled:opacity-50",
						value: surface,
						disabled: change !== "surface",
						onChange: (e) => setSurface(e.target.value),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "ice",
								children: "Ice"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "wood",
								children: "Wood floor"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "carpet",
								children: "Carpet"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "sandpaper",
								children: "Sandpaper"
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "text-sm",
					children: ["Car mass", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: "mt-1 w-full rounded-md border border-line bg-surface px-2 py-2 disabled:opacity-50",
						value: mass,
						disabled: change !== "mass",
						onChange: (e) => setMass(e.target.value),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "light",
								children: "Light"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "medium",
								children: "Medium"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "heavy",
								children: "Heavy"
							})
						]
					})]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3 flex flex-wrap gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: run,
				disabled: running,
				children: running ? "Rolling…" : "Release the car"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				onClick: () => {
					setDist(null);
					setCar(0);
				},
				children: "Reset"
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-xs text-muted",
			children: "Dependent variable: distance past the ramp (meters)"
		}),
		trials.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 overflow-x-auto",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "text-left text-xs text-muted",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "py-1",
							children: "Trial"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Changed" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Height" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Surface" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Mass" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Distance" })
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: trials.map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-t border-line",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "py-1 tabular-nums",
							children: i + 1
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: String(t.changed ?? "—") }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: String(t.height) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: String(t.surface) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: String(t.mass) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "tabular-nums",
							children: [Number(t.m).toFixed(1), " m"]
						})
					]
				}, i)) })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 flex items-end gap-1.5",
				children: trials.map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-1 flex-col items-center gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "w-full max-w-8 rounded-t-sm bg-forest",
						style: { height: `${Math.max(6, Number(t.m) / maxBar * 72)}px` }
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-faint",
						children: i + 1
					})]
				}, i))
			})]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-sm text-muted",
			children: "No trials yet. Release the car to record one."
		})
	] });
}
function RocketLab() {
	const addTrial = useLabStore((s) => s.addTrial);
	const trials = useLabStore((s) => s.byLab.rocket?.trials) ?? EMPTY_TRIALS;
	const [thrust, setThrust] = (0, import_react.useState)(6);
	const [cargo, setCargo] = (0, import_react.useState)(2);
	const [friction, setFriction] = (0, import_react.useState)(2);
	const [x, setX] = (0, import_react.useState)(28);
	const dist = Math.max(8, Math.round(thrust * 14 / (.6 + cargo * .35 + friction * .4)));
	function launch() {
		setX(28);
		window.setTimeout(() => setX(28 + Math.min(330, dist * 2.2)), 30);
		addTrial("rocket", {
			thrust,
			cargo,
			friction,
			cm: dist
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stage, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			viewBox: "0 0 400 120",
			className: "h-auto w-full",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: "16",
				y1: "64",
				x2: "384",
				y2: "64",
				stroke: "var(--color-faint)",
				strokeWidth: "3"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
				style: {
					transform: `translateX(${x - 28}px)`,
					transition: "transform 0.85s ease-out"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
					cx: "28",
					cy: "64",
					rx: 16 + cargo,
					ry: 12 + cargo * .4,
					fill: "var(--color-forest)"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: `M12 64 Q${0 - thrust} 52 6 64 Q${0 - thrust} 76 12 64`,
					fill: "var(--color-bad)",
					opacity: "0.7"
				})]
			})]
		}) }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-3 sm:grid-cols-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "text-sm",
					children: [
						"Thrust ",
						thrust,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "range",
							min: 1,
							max: 10,
							value: thrust,
							onChange: (e) => setThrust(Number(e.target.value)),
							className: "mt-1 w-full accent-forest"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "text-sm",
					children: [
						"Cargo ",
						cargo,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "range",
							min: 0,
							max: 8,
							value: cargo,
							onChange: (e) => setCargo(Number(e.target.value)),
							className: "mt-1 w-full accent-forest"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "text-sm",
					children: [
						"String friction ",
						friction,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "range",
							min: 0,
							max: 8,
							value: friction,
							onChange: (e) => setFriction(Number(e.target.value)),
							className: "mt-1 w-full accent-forest"
						})
					]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			className: "mt-3",
			onClick: launch,
			children: "Launch"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-2 text-sm text-muted",
			children: [
				"About ",
				dist,
				" cm. More thrust, less cargo, less friction — a fair test changes only one."
			]
		}),
		trials.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "mt-4 w-full text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "text-left text-xs text-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "py-1",
						children: "Thrust"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Cargo" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Friction" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "cm" })
				]
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: trials.map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-t border-line",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "py-1",
						children: String(t.thrust)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: String(t.cargo) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: String(t.friction) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "tabular-nums",
						children: String(t.cm)
					})
				]
			}, i)) })]
		}) : null
	] });
}
function DistanceLab() {
	const [place, setPlace] = (0, import_react.useState)("earth");
	const [mass, setMass] = (0, import_react.useState)("both");
	const [dropped, setDropped] = (0, import_react.useState)(false);
	const [floor, setFloor] = (0, import_react.useState)("ice");
	const [pushed, setPushed] = (0, import_react.useState)(false);
	const [poles, setPoles] = (0, import_react.useState)("opposite");
	const earth = place === "earth";
	const dropY = !dropped ? 28 : earth ? 96 : 28;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Stage, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-4 pt-3 text-xs tracking-wide text-muted uppercase",
					children: "Gravity — no touching"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
					viewBox: "0 0 400 130",
					className: "h-auto w-full",
					children: [
						earth ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
							x: "0",
							y: "114",
							width: "400",
							height: "16",
							fill: "var(--color-line-strong)"
						}) : null,
						(mass === "both" || mass === "light") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: "150",
							cy: dropY,
							r: "11",
							fill: "var(--color-forest)",
							style: { transition: "cy 0.7s ease-in" }
						}),
						(mass === "both" || mass === "heavy") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: "250",
							cy: dropY,
							r: "16",
							fill: "var(--color-forest-deep)",
							style: { transition: "cy 0.7s ease-in" }
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2 p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: place === "earth" ? "default" : "secondary",
							onClick: () => setPlace("earth"),
							children: "Earth"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: place === "space" ? "default" : "secondary",
							onClick: () => setPlace("space"),
							children: "Space"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: mass === "both" ? "default" : "secondary",
							onClick: () => setMass("both"),
							children: "Light + heavy"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							onClick: () => setDropped((d) => !d),
							children: dropped ? "Reset drop" : "Drop"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-4 pb-3 text-sm text-muted",
					children: earth ? dropped ? "They land together. Gravity pulls both down — mass does not change the pattern here." : "Drop on Earth. Watch the light and heavy balls." : "In space the balls stay. Gravity is much weaker far from Earth."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Stage, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-4 pt-3 text-xs tracking-wide text-muted uppercase",
					children: "Friction — needs a touch"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
					viewBox: "0 0 400 80",
					className: "h-auto w-full",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: "20",
						y: "52",
						width: "360",
						height: "10",
						fill: floor === "ice" ? "var(--color-chalk)" : "var(--color-line-strong)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: pushed ? floor === "ice" ? 300 : 150 : 40,
						y: "38",
						width: "28",
						height: "14",
						fill: "var(--color-forest)",
						style: { transition: "x 0.8s ease-out" }
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2 p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: floor === "ice" ? "default" : "secondary",
							onClick: () => setFloor("ice"),
							children: "Ice"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: floor === "sandpaper" ? "default" : "secondary",
							onClick: () => setFloor("sandpaper"),
							children: "Sandpaper"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							onClick: () => setPushed((p) => !p),
							children: pushed ? "Reset" : "Push"
						})
					]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Stage, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-4 pt-3 text-xs tracking-wide text-muted uppercase",
					children: "Magnetism — at a distance"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
					viewBox: "0 0 400 90",
					className: "h-auto w-full",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: "80",
						y: "32",
						width: "44",
						height: "26",
						rx: "3",
						fill: "var(--color-bad)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: poles === "opposite" ? 168 : 250,
						y: "32",
						width: "44",
						height: "26",
						rx: "3",
						fill: "var(--color-forest)",
						style: { transition: "x 0.45s ease" }
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2 p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: poles === "opposite" ? "default" : "secondary",
						onClick: () => setPoles("opposite"),
						children: "Attract"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: poles === "same" ? "default" : "secondary",
						onClick: () => setPoles("same"),
						children: "Repel"
					})]
				})
			] })
		]
	});
}
function CanyonLab() {
	const [speed, setSpeed] = (0, import_react.useState)(3);
	const [play, setPlay] = (0, import_react.useState)(0);
	const depth = Math.round(8 + play * speed * 12);
	const usedFast = speed >= 6 && play > 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LandPlay, {
		label: `How fast the water is: ${speed === 1 ? "trickle" : speed >= 6 ? "fast river" : "river"}`,
		value: speed,
		onChange: setSpeed,
		onPlay: () => setPlay((p) => Math.min(8, p + 1)),
		caption: `Water erosion wears land down ${depth} m. Palo Duro Canyon was cut by the Prairie Dog Town Fork of the Red River.`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			viewBox: "0 0 400 170",
			className: "h-auto w-full",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: "0",
					y: "0",
					width: "400",
					height: "170",
					fill: "var(--color-chalk)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: `M0,24 L200,${26 + Math.min(120, depth * .9)} L400,24 L400,170 L0,170 Z`,
					fill: "var(--color-line-strong)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: `M188,${26 + Math.min(120, depth * .9)} Q200,${34 + Math.min(120, depth * .9)} 212,${26 + Math.min(120, depth * .9)}`,
					fill: "none",
					stroke: "var(--color-forest)",
					strokeWidth: "5"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("text", {
					x: "200",
					y: "18",
					textAnchor: "middle",
					fill: "var(--color-muted)",
					fontSize: "11",
					children: [
						"V-shaped canyon · ",
						depth,
						" m"
					]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChallengeList, { items: [{
			ok: depth >= 80,
			text: "Cut a canyon at least 80 m deep."
		}, {
			ok: usedFast,
			text: "Use fast water — it should carve quicker than a trickle."
		}] })]
	});
}
function ValleyLab() {
	const [step, setStep] = (0, import_react.useState)(0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stage, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			viewBox: "0 0 400 170",
			className: "h-auto w-full",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: "0",
					y: "0",
					width: "400",
					height: "170",
					fill: "var(--color-chalk)"
				}),
				step >= 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M0,36 L70,36 Q200,150 330,36 L400,36 L400,170 L0,170 Z",
					fill: "var(--color-line-strong)"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M0,36 L200,140 L400,36 L400,170 L0,170 Z",
					fill: "var(--color-line-strong)"
				}),
				!(step >= 2) && step >= 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
					cx: "200",
					cy: "96",
					rx: "96",
					ry: "30",
					fill: "var(--color-bg)",
					opacity: "0.9"
				}) : null
			]
		}) }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3 flex flex-wrap gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					onClick: () => setStep(0),
					children: "V-valley"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => setStep(1),
					children: "Add glacier"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					onClick: () => setStep(2),
					children: "Melt the ice"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-muted",
			children: step === 0 ? "A river valley starts as a V." : step === 1 ? "Ice scrapes the V into a wide U." : "The U can stay after the glacier is gone. The agent may be missing; the shape is the evidence."
		})
	] });
}
function DeltaLab() {
	const [sediment, setSediment] = (0, import_react.useState)(4);
	const [play, setPlay] = (0, import_react.useState)(1);
	const spread = 18 + sediment * play * 7;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LandPlay, {
		label: `Sediment load ${sediment}`,
		value: sediment,
		onChange: setSediment,
		onPlay: () => setPlay((p) => Math.min(6, p + 1)),
		caption: "The river slows at the sea and drops a triangle of new land.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			viewBox: "0 0 400 170",
			className: "h-auto w-full",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: "0",
					y: "0",
					width: "400",
					height: "170",
					fill: "var(--color-chalk)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: "0",
					y: "0",
					width: "176",
					height: "170",
					fill: "var(--color-paper)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
					points: `176,85 176,${85 - spread / 2} ${176 + spread},85 176,${85 + spread / 2}`,
					fill: "var(--color-line-strong)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: "0",
					y: "81",
					width: "176",
					height: "8",
					fill: "var(--color-forest)"
				})
			]
		})
	});
}
function DunesLab() {
	const [wind, setWind] = (0, import_react.useState)(4);
	const [play, setPlay] = (0, import_react.useState)(0);
	const x = 70 + play * wind * 6;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LandPlay, {
		label: `Wind ${wind}`,
		value: wind,
		onChange: setWind,
		onPlay: () => setPlay((p) => Math.min(8, p + 1)),
		caption: "Wind hops sand up the gentle slope and dumps it on the slip face. Monahans Sandhills.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			viewBox: "0 0 400 160",
			className: "h-auto w-full",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: "0",
					y: "0",
					width: "400",
					height: "160",
					fill: "var(--color-paper)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: "0",
					y: "118",
					width: "400",
					height: "42",
					fill: "var(--color-line)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
					points: `${x},118 ${x + 88},118 ${x + 62},72`,
					fill: "var(--color-line-strong)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: "24",
					y1: "40",
					x2: "80",
					y2: "40",
					stroke: "var(--color-muted)",
					strokeWidth: "2",
					markerEnd: "url(#arrow)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
					x: "24",
					y: "32",
					fill: "var(--color-muted)",
					fontSize: "11",
					children: "wind"
				})
			]
		})
	});
}
function LandPlay({ label, value, onChange, onPlay, caption, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stage, { children }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
			className: "mt-3 block text-sm",
			children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "range",
				min: 1,
				max: 8,
				value,
				onChange: (e) => onChange(Number(e.target.value)),
				className: "mt-1 w-full accent-forest"
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			className: "mt-3",
			onClick: onPlay,
			children: "Play time"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-muted",
			children: caption
		})
	] });
}
function LightupLab() {
	const [closed, setClosed] = (0, import_react.useState)(false);
	const [broken, setBroken] = (0, import_react.useState)(false);
	const on = closed && !broken;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stage, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			viewBox: "0 0 400 170",
			className: "h-auto w-full",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: "36",
					y: "72",
					width: "40",
					height: "24",
					rx: "3",
					fill: "var(--color-forest)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
					x: "56",
					y: "88",
					textAnchor: "middle",
					fill: "var(--color-bg)",
					fontSize: "9",
					children: "+ −"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "328",
					cy: "84",
					r: "20",
					fill: on ? "var(--color-chalk)" : "var(--color-line)",
					stroke: "var(--color-forest)",
					strokeWidth: "3"
				}),
				on ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "328",
					cy: "84",
					r: "8",
					fill: "var(--color-forest)"
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M76 84 H168",
					stroke: "var(--color-ink)",
					strokeWidth: "3"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M228 84 H308",
					stroke: "var(--color-ink)",
					strokeWidth: "3"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: broken ? "M36 96 V138 H328 V104" : "M36 96 V138 H328 V84",
					stroke: "var(--color-ink)",
					strokeWidth: "3",
					fill: "none"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: "168",
					y: closed ? 76 : 62,
					width: "60",
					height: "16",
					fill: "var(--color-bad)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
					x: "198",
					y: "48",
					textAnchor: "middle",
					fill: "var(--color-muted)",
					fontSize: "11",
					children: closed ? "closed switch" : "open switch"
				})
			]
		}) }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3 flex flex-wrap gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: () => setClosed((c) => !c),
				children: closed ? "Open switch" : "Close it"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				onClick: () => setBroken((b) => !b),
				children: broken ? "Fix the wire" : "Break a wire"
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-muted",
			children: on ? "Closed path. Electrical energy reaches the load — the bulb lights." : "Open switch or broken wire — no complete path."
		})
	] });
}
function EnergyLab() {
	const loads = [
		{
			id: "bulb",
			label: "Bulb",
			out: "light"
		},
		{
			id: "fan",
			label: "Fan",
			out: "motion"
		},
		{
			id: "buzzer",
			label: "Buzzer",
			out: "sound"
		},
		{
			id: "coil",
			label: "Coil",
			out: "thermal energy"
		}
	];
	const [load, setLoad] = (0, import_react.useState)(loads[0]);
	const [on, setOn] = (0, import_react.useState)(true);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stage, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			viewBox: "0 0 400 170",
			className: "h-auto w-full",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: "28",
					y: "72",
					width: "44",
					height: "26",
					rx: "3",
					fill: "var(--color-forest)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
					x: "50",
					y: "89",
					textAnchor: "middle",
					fill: "var(--color-bg)",
					fontSize: "9",
					children: "+ −"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M72 85 H160",
					stroke: "var(--color-ink)",
					strokeWidth: "3"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: "160",
					y: on ? 78 : 64,
					width: "56",
					height: "14",
					fill: "var(--color-bad)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M216 85 H268",
					stroke: "var(--color-ink)",
					strokeWidth: "3"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M28 98 V138 H348 V85",
					stroke: "var(--color-ink)",
					strokeWidth: "3",
					fill: "none"
				}),
				load.id === "bulb" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "320",
					cy: "85",
					r: "22",
					fill: on ? "var(--color-chalk)" : "var(--color-line)",
					stroke: "var(--color-forest)",
					strokeWidth: "3"
				}), on ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "320",
					cy: "85",
					r: "8",
					fill: "var(--color-forest)"
				}) : null] }) : null,
				load.id === "fan" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
					transform: "translate(320 85)",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						r: "8",
						fill: "var(--color-forest)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
						className: on ? "animate-spin" : void 0,
						style: { transformOrigin: "0px 0px" },
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
								x: "-4",
								y: "-28",
								width: "8",
								height: "20",
								rx: "2",
								fill: "var(--color-ink)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
								x: "-4",
								y: "8",
								width: "8",
								height: "20",
								rx: "2",
								fill: "var(--color-ink)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
								x: "-28",
								y: "-4",
								width: "20",
								height: "8",
								rx: "2",
								fill: "var(--color-ink)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
								x: "8",
								y: "-4",
								width: "20",
								height: "8",
								rx: "2",
								fill: "var(--color-ink)"
							})
						]
					})]
				}) : null,
				load.id === "buzzer" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
					transform: "translate(320 85)",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: "-18",
						y: "-14",
						width: "36",
						height: "28",
						rx: "6",
						fill: "var(--color-forest)"
					}), on ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M22 -10 Q34 0 22 10",
						fill: "none",
						stroke: "var(--color-ink)",
						strokeWidth: "2"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M30 -16 Q48 0 30 16",
						fill: "none",
						stroke: "var(--color-muted)",
						strokeWidth: "2"
					})] }) : null]
				}) : null,
				load.id === "coil" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
					transform: "translate(320 85)",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M-24 0 C-16 -16, -8 16, 0 0 C8 -16, 16 16, 24 0",
						fill: "none",
						stroke: "var(--color-bad)",
						strokeWidth: "4"
					}), on ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
							d: "M-8 -22 L-4 -30",
							stroke: "var(--color-bad)",
							strokeWidth: "2"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
							d: "M4 -22 L8 -32",
							stroke: "var(--color-bad)",
							strokeWidth: "2"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
							d: "M14 -18 L20 -28",
							stroke: "var(--color-bad)",
							strokeWidth: "2"
						})
					] }) : null]
				}) : null
			]
		}) }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-3 font-display text-2xl leading-snug sm:text-3xl",
			children: ["chemical → electrical → ", on ? load.out : "off"]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted",
			children: "Same battery. Swap the load. Open the switch to stop the path."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3 flex flex-wrap gap-2",
			children: [loads.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: load.id === l.id ? "default" : "secondary",
				onClick: () => setLoad(l),
				children: l.label
			}, l.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				onClick: () => setOn((v) => !v),
				children: on ? "Open switch" : "Close switch"
			})]
		})
	] });
}
function ConductLab() {
	const materials = [
		{
			id: "foil",
			label: "Foil",
			ok: true
		},
		{
			id: "penny",
			label: "Penny",
			ok: true
		},
		{
			id: "lead",
			label: "Pencil lead",
			ok: true
		},
		{
			id: "rubber",
			label: "Rubber band",
			ok: false
		},
		{
			id: "wood",
			label: "Wood",
			ok: false
		},
		{
			id: "yarn",
			label: "Yarn",
			ok: false
		}
	];
	const [gap, setGap] = (0, import_react.useState)(null);
	const on = gap?.ok === true;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stage, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			viewBox: "0 0 400 150",
			className: "h-auto w-full",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: "28",
					y: "64",
					width: "36",
					height: "22",
					rx: "3",
					fill: "var(--color-forest)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M64 75 H150",
					stroke: "var(--color-ink)",
					strokeWidth: "3"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M250 75 H330",
					stroke: "var(--color-ink)",
					strokeWidth: "3"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M28 86 V118 H360 V75",
					stroke: "var(--color-ink)",
					strokeWidth: "3",
					fill: "none"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "348",
					cy: "75",
					r: "16",
					fill: on ? "var(--color-chalk)" : "var(--color-line)",
					stroke: "var(--color-forest)",
					strokeWidth: "3"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: "158",
					y: "60",
					width: "84",
					height: "30",
					rx: "4",
					fill: gap ? on ? "var(--color-forest-soft)" : "var(--color-bad-soft)" : "var(--color-surface)",
					stroke: "var(--color-line-strong)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
					x: "200",
					y: "80",
					textAnchor: "middle",
					fontSize: "11",
					fill: "var(--color-ink)",
					children: gap ? gap.label : "gap"
				})
			]
		}) }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 font-display text-xl",
			children: gap ? gap.ok ? "Bulb ON — conductor" : "Bulb dark — insulator" : "Tap a material to test it in the gap."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3 flex flex-wrap gap-2",
			children: materials.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: gap?.id === m.id ? "default" : "secondary",
				onClick: () => setGap(m),
				children: m.label
			}, m.id))
		})
	] });
}
var ROCK_STEPS = [
	{
		id: "weathering",
		title: "Weathering",
		line: "Rock breaks. Bits stay in place.",
		cue: "break"
	},
	{
		id: "erosion",
		title: "Erosion",
		line: "Wind, water, or ice carries the bits away.",
		cue: "move"
	},
	{
		id: "deposition",
		title: "Deposition",
		line: "The bits drop in layers.",
		cue: "drop"
	},
	{
		id: "compaction",
		title: "Compaction",
		line: "New layers squeeze the old ones.",
		cue: "squeeze"
	},
	{
		id: "cementation",
		title: "Cementation",
		line: "Minerals glue the grains. Sedimentary rock.",
		cue: "glue"
	}
];
function RockPicture({ id }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 400 140",
		className: "h-auto w-full",
		children: [
			id === "weathering" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: "40",
					y: "20",
					width: "90",
					height: "100",
					fill: "var(--color-line-strong)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M70 20 L78 60 L62 100",
					stroke: "var(--color-ink)",
					strokeWidth: "2",
					fill: "none"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "160",
					cy: "108",
					r: "8",
					fill: "var(--color-muted)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "184",
					cy: "114",
					r: "6",
					fill: "var(--color-muted)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "148",
					cy: "118",
					r: "5",
					fill: "var(--color-faint)"
				})
			] }) : null,
			id === "erosion" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M20 80 Q120 60 220 90 T380 70",
					fill: "none",
					stroke: "var(--color-forest)",
					strokeWidth: "6"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "120",
					cy: "74",
					r: "6",
					fill: "var(--color-line-strong)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "200",
					cy: "86",
					r: "5",
					fill: "var(--color-muted)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "280",
					cy: "78",
					r: "7",
					fill: "var(--color-line-strong)"
				})
			] }) : null,
			id === "deposition" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: "40",
					y: "100",
					width: "320",
					height: "16",
					fill: "var(--color-line)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: "50",
					y: "84",
					width: "300",
					height: "16",
					fill: "var(--color-line-strong)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: "70",
					y: "68",
					width: "260",
					height: "16",
					fill: "var(--color-muted)"
				})
			] }) : null,
			id === "compaction" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: "70",
					y: "88",
					width: "260",
					height: "18",
					fill: "var(--color-line)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: "70",
					y: "70",
					width: "260",
					height: "12",
					fill: "var(--color-line-strong)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M200 24 L200 58 M188 46 L200 58 L212 46",
					stroke: "var(--color-ink)",
					strokeWidth: "3",
					fill: "none"
				})
			] }) : null,
			id === "cementation" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "130",
					cy: "80",
					r: "18",
					fill: "var(--color-line-strong)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "168",
					cy: "86",
					r: "16",
					fill: "var(--color-muted)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "204",
					cy: "78",
					r: "17",
					fill: "var(--color-line-strong)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "238",
					cy: "88",
					r: "14",
					fill: "var(--color-faint)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M148 80 Q168 70 188 82",
					stroke: "var(--color-forest)",
					strokeWidth: "3",
					fill: "none"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M184 86 Q210 96 226 84",
					stroke: "var(--color-forest)",
					strokeWidth: "3",
					fill: "none"
				})
			] }) : null
		]
	});
}
function StoryLab() {
	const [step, setStep] = (0, import_react.useState)(0);
	const s = ROCK_STEPS[step];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Stage, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "px-4 pt-3 text-xs tracking-wide text-muted uppercase",
			children: [
				"Step ",
				step + 1,
				" of 5"
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RockPicture, { id: s.id }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "px-4 pb-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-3xl",
				children: s.title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-ink-soft",
				children: s.line
			})]
		})
	] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-3 flex flex-wrap gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "secondary",
			onClick: () => setStep(0),
			disabled: step === 0,
			children: "Still"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			onClick: () => setStep((n) => Math.min(4, n + 1)),
			disabled: step >= 4,
			children: "Play"
		})]
	})] });
}
function ProcessLab() {
	const pics = (0, import_react.useMemo)(() => {
		const copy = [...ROCK_STEPS];
		for (let i = copy.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[copy[i], copy[j]] = [copy[j], copy[i]];
		}
		return copy;
	}, []);
	const [i, setI] = (0, import_react.useState)(0);
	const [show, setShow] = (0, import_react.useState)(false);
	const pic = pics[i];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Stage, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RockPicture, { id: pic.id }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-4 pb-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-display text-2xl",
			children: show ? pic.title : "Which process?"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-ink-soft",
			children: show ? pic.line : "Look at the still picture. Whisper a word, then reveal."
		})]
	})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-3 flex flex-wrap gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			onClick: () => setShow(true),
			children: "Reveal"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "secondary",
			onClick: () => {
				setShow(false);
				setI((n) => (n + 1) % pics.length);
			},
			children: "Next picture"
		})]
	})] });
}
function OrderLab() {
	const target = ROCK_STEPS.map((s) => s.id);
	const [picked, setPicked] = (0, import_react.useState)([]);
	const remaining = ROCK_STEPS.filter((s) => !picked.includes(s.id));
	const ok = picked.length === 5 && picked.every((id, i) => id === target[i]);
	const wrong = picked.length === 5 && !ok;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-2 text-sm text-muted",
			children: "Tap in order: break, move, drop, squeeze, glue."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-wrap gap-2",
			children: remaining.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				onClick: () => setPicked((p) => [...p, s.id]),
				children: s.title
			}, s.id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
			className: "mt-4 list-decimal space-y-1 pl-5 text-sm",
			children: picked.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: ROCK_STEPS.find((s) => s.id === id)?.title }, id))
		}),
		ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-sm text-good",
			children: "That’s the sequence."
		}) : null,
		wrong ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-sm text-bad",
			children: "Not quite. Reset and try break → move → drop → squeeze → glue."
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			className: "mt-3",
			variant: "ghost",
			onClick: () => setPicked([]),
			children: "Reset"
		})
	] });
}
function FuelsLab() {
	const beats = [
		{
			t: "Living things grow in a swamp, forest, or sea.",
			id: "weathering"
		},
		{
			t: "They die and get buried in sediment.",
			id: "deposition"
		},
		{
			t: "Time, heat, and pressure change the remains.",
			id: "compaction"
		},
		{
			t: "Coal, oil, or natural gas ends up in sedimentary rock.",
			id: "cementation"
		}
	];
	const [i, setI] = (0, import_react.useState)(0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Stage, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "px-4 pt-3 text-xs tracking-wide text-muted uppercase",
			children: [
				i + 1,
				" / ",
				beats.length
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RockPicture, { id: beats[i].id }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "px-4 pb-5 font-display text-2xl leading-snug",
			children: beats[i].t
		})
	] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		className: "mt-3",
		onClick: () => setI((n) => Math.min(beats.length - 1, n + 1)),
		disabled: i >= beats.length - 1,
		children: "Next"
	})] });
}
function LabPage() {
	const { labId } = Route$3.useParams();
	const lab = labById(labId);
	if (!lab) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ScienceShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-ink-soft",
		children: "That lab isn’t here."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/science",
		className: "mt-3 inline-block text-sm text-forest",
		children: "Back to Science Hacks"
	})] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScienceShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LabFrame, {
		lab,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LabSim, { id: lab.id })
	}) });
}
//#endregion
export { LabPage as component };
