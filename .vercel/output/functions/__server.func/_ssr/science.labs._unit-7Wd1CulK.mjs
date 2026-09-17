import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { f as Check, g as ArrowRight } from "../_libs/lucide-react.mjs";
import { n as CardContent, t as Card } from "./card-Clcq4lIV.mjs";
import { t as Badge } from "./badge-Gu7_XEK4.mjs";
import { i as Route$2 } from "./router-B5VgnKaN.mjs";
import { a as glossaryForUnit, c as labsForUnit, n as LAB_UNITS, o as isLabUnit, r as ScienceShell } from "./science-shell-Ba2jLADM.mjs";
import { n as labRecord, r as useLabStore } from "./lab-store-D1m1ljYL.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/science.labs._unit-7Wd1CulK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function UnitPage() {
	const { unit } = Route$2.useParams();
	const byLab = useLabStore((s) => s.byLab);
	const [mounted, setMounted] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setMounted(true), []);
	if (!isLabUnit(unit)) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ScienceShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-ink-soft",
		children: "That unit isn’t here."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/science",
		className: "mt-3 inline-block text-sm text-forest",
		children: "Back to Science Hacks"
	})] });
	const meta = LAB_UNITS.find((u) => u.id === unit);
	const labs = labsForUnit(unit);
	const done = mounted ? labs.filter((l) => byLab[l.id]?.finished).length : 0;
	const words = glossaryForUnit(unit);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ScienceShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-medium tracking-[0.16em] text-forest uppercase",
			children: meta.teks
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mt-1 font-display text-4xl font-semibold tracking-tight",
			children: meta.name
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 max-w-xl text-ink-soft",
			children: meta.blurb
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-2 text-sm text-muted",
			children: [
				meta.duration,
				" · ",
				done,
				" of ",
				labs.length,
				" finished"
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-8 grid gap-3",
			children: labs.map((lab) => {
				const rec = mounted ? labRecord(byLab, lab.id) : {
					finished: false,
					claim: "",
					trials: []
				};
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/science/lab/$labId",
					params: { labId: lab.id },
					className: "group block no-underline",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "transition-[border-color] hover:border-line-strong",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "flex items-start gap-4 p-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "min-w-0 flex-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex flex-wrap items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-display text-xl font-medium",
											children: lab.title
										}), rec.finished ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
											variant: "readiness",
											className: "normal-case tracking-normal",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "mr-1 size-3" }), "Finished"]
										}) : null]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mt-1 block text-sm text-muted",
										children: lab.kicker
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mt-2 block text-sm text-ink-soft",
										children: lab.blurb
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "mt-2 block text-sm text-ink",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-medium",
											children: "Investigate: "
										}), lab.question]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "mt-2 block text-xs text-faint",
										children: [
											lab.teks.join(" · "),
											" · ",
											lab.duration
										]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "mt-1 size-4 shrink-0 text-faint transition-transform group-hover:translate-x-0.5" })]
						})
					})
				}, lab.id);
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-lg font-medium",
				children: "Word bank"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
				className: "mt-3 grid gap-3 sm:grid-cols-2",
				children: words.map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg border border-line bg-surface px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-sm font-medium text-ink",
						children: w.term
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "mt-1 text-sm text-muted",
						children: w.meaning
					})]
				}, w.term))
			})]
		})
	] });
}
//#endregion
export { UnitPage as component };
