import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as CardContent, t as Card } from "./card-Clcq4lIV.mjs";
import { t as Button } from "./button-CwfzykdW.mjs";
import { i as WORD_BANK, r as ScienceShell, t as LABS } from "./science-shell-Ba2jLADM.mjs";
import { n as labRecord, r as useLabStore, t as finishedCount } from "./lab-store-D1m1ljYL.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/science.notebook-WbNmOVKq.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function NotebookPage() {
	const byLab = useLabStore((s) => s.byLab);
	const quiz = useLabStore((s) => s.quiz);
	const resetLabs = useLabStore((s) => s.resetLabs);
	const [mounted, setMounted] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setMounted(true), []);
	const done = mounted ? finishedCount(byLab) : 0;
	const trials = mounted ? Object.values(byLab).reduce((n, r) => n + r.trials.length, 0) : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ScienceShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-medium tracking-[0.16em] text-forest uppercase",
			children: "Scientist notebook"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mt-1 font-display text-4xl font-semibold tracking-tight",
			children: "Your claims and data"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 max-w-xl text-sm text-muted",
			children: "Everything here stays on this device. Teachers can screenshot a page or have students copy a claim into a journal."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-3 text-sm text-ink-soft",
			children: [
				"Labs finished: ",
				done,
				"/16 · Trials recorded: ",
				trials,
				" · Check-it:",
				" ",
				mounted && quiz ? `${quiz.score}/${quiz.total}` : "—"
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-8 grid gap-3",
			children: LABS.map((lab) => {
				const rec = mounted ? labRecord(byLab, lab.id) : {
					finished: false,
					claim: "",
					trials: []
				};
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-lg font-medium",
								children: lab.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted",
								children: lab.question
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								size: "sm",
								variant: "secondary",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/science/lab/$labId",
									params: { labId: lab.id },
									children: "Open lab"
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-ink-soft",
							children: rec.claim ? rec.claim : rec.finished ? "Finished — no claim saved yet." : "No claim saved yet."
						}),
						rec.trials.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-xs text-faint",
							children: [
								rec.trials.length,
								" trial",
								rec.trials.length === 1 ? "" : "s",
								" recorded"
							]
						}) : null
					]
				}) }, lab.id);
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-lg font-medium",
				children: "Word bank"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
				className: "mt-3 grid gap-3 sm:grid-cols-2",
				children: WORD_BANK.map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg border border-line bg-surface px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-sm font-medium",
						children: w.term
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "mt-1 text-sm text-muted",
						children: w.meaning
					})]
				}, w.term))
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			className: "mt-10",
			variant: "ghost",
			onClick: () => {
				if (window.confirm("Clear notebook on this device? Lab progress, claims, and quiz score will be erased.")) resetLabs();
			},
			children: "Clear notebook on this device"
		})
	] });
}
//#endregion
export { NotebookPage as component };
