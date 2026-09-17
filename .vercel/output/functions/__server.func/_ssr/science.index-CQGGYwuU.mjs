import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as PenLine, d as ClipboardCheck, g as ArrowRight, h as BookOpen, l as GraduationCap, o as Mountain, s as Layers, t as Zap, u as FlaskConical } from "../_libs/lucide-react.mjs";
import { n as CardContent, t as Card } from "./card-Clcq4lIV.mjs";
import { n as LAB_UNITS, r as ScienceShell } from "./science-shell-Ba2jLADM.mjs";
import { r as useLabStore, t as finishedCount } from "./lab-store-D1m1ljYL.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/science.index-CQGGYwuU.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ICONS = {
	forces: FlaskConical,
	landforms: Mountain,
	circuits: Zap,
	rocks: Layers
};
var UNIT_LABS = {
	forces: [
		"equal",
		"ramp",
		"rocket",
		"distance"
	],
	landforms: [
		"canyon",
		"valley",
		"delta",
		"dunes"
	],
	circuits: [
		"build",
		"lightup",
		"energy",
		"conduct"
	],
	rocks: [
		"story",
		"process",
		"order",
		"fuels"
	]
};
function ScienceHome() {
	const byLab = useLabStore((s) => s.byLab);
	const [mounted, setMounted] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setMounted(true), []);
	const done = mounted ? finishedCount(byLab) : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ScienceShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-medium tracking-[0.18em] text-forest uppercase",
			children: "Science Hacks · Texas Grade 5"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl",
			children: "Where do you want to go?"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 max-w-lg text-ink-soft",
			children: "Pick a unit, open your notebook, or check what you know."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-2 text-xs text-faint",
			children: [done, " of 16 labs finished"]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-8 grid gap-3 sm:grid-cols-2",
			children: [
				LAB_UNITS.map((u) => {
					const Icon = ICONS[u.id];
					const n = mounted ? UNIT_LABS[u.id].filter((id) => byLab[id]?.finished).length : 0;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/science/labs/$unit",
						params: { unit: u.id },
						className: "group block no-underline",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
							className: "h-full transition-[border-color] hover:border-line-strong",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								className: "flex gap-3 p-5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid size-11 shrink-0 place-items-center rounded-lg bg-forest-soft text-forest",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "min-w-0 flex-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-center justify-between gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-display text-lg font-medium",
												children: u.title
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4 text-faint transition-transform group-hover:translate-x-0.5" })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mt-1 block text-sm text-muted",
											children: u.blurb
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "mt-2 block text-xs text-faint",
											children: [
												n,
												"/4 done · ",
												u.teks
											]
										})
									]
								})]
							})
						})
					}, u.id);
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/science/notebook",
					className: "group block no-underline",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "h-full transition-[border-color] hover:border-line-strong",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "flex gap-3 p-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid size-11 shrink-0 place-items-center rounded-lg bg-forest-soft text-forest",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "size-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-2 font-display text-lg font-medium",
								children: ["Notebook", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4 text-faint" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-1 block text-sm text-muted",
								children: "Claims, evidence, and your trial data."
							})] })]
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/science/quiz",
					className: "group block no-underline",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "h-full transition-[border-color] hover:border-line-strong",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "flex gap-3 p-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid size-11 shrink-0 place-items-center rounded-lg bg-forest-soft text-forest",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardCheck, { className: "size-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-2 font-display text-lg font-medium",
								children: ["Check it", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4 text-faint" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-1 block text-sm text-muted",
								children: "STAAR-style questions for all units."
							})] })]
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/science/teacher",
					className: "group block no-underline",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "h-full transition-[border-color] hover:border-line-strong",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "flex gap-3 p-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid size-11 shrink-0 place-items-center rounded-lg bg-forest-soft text-forest",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraduationCap, { className: "size-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-2 font-display text-lg font-medium",
								children: ["Teachers", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4 text-faint" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-1 block text-sm text-muted",
								children: "Lesson paths, TEKS, and classroom notes."
							})] })]
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/science/staar",
					className: "group block no-underline",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "h-full transition-[border-color] hover:border-line-strong",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "flex gap-3 p-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid size-11 shrink-0 place-items-center rounded-lg bg-forest-soft text-forest",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenLine, { className: "size-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-2 font-display text-lg font-medium",
								children: ["STAAR stations", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4 text-faint" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-1 block text-sm text-muted",
								children: "Generated items for every Grade 5 science TEKS."
							})] })]
						})
					})
				})
			]
		})
	] });
}
//#endregion
export { ScienceHome as component };
