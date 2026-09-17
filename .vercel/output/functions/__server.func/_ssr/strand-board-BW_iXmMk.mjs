import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { _ as ArrowLeft, g as ArrowRight } from "../_libs/lucide-react.mjs";
import { i as useProgress, n as accuracy, t as AppShell } from "./app-shell-Dqa0Wea-.mjs";
import { n as CardContent, t as Card } from "./card-Clcq4lIV.mjs";
import { r as getSubject } from "./subjects-D31VD3Iu.mjs";
import { r as SubjectHomeLink, t as PracticeLink } from "./subject-links--i5cpWl4.mjs";
import { t as Badge } from "./badge-Gu7_XEK4.mjs";
import { t as Button } from "./button-CwfzykdW.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/strand-board-BW_iXmMk.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function weightVariant(w) {
	return w;
}
function weightLabel(w) {
	if (w === "readiness") return "Readiness";
	if (w === "supporting") return "Supporting";
	return "Classroom";
}
function StrandBoard({ subject, strandId }) {
	const sub = getSubject(subject);
	const strand = sub.strandById(strandId);
	const ses = sub.expectationsForStrand(strandId);
	const byTeks = useProgress((s) => s.byTeks);
	const [mounted, setMounted] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setMounted(true), []);
	if (!strand) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-ink-soft",
		children: "That station is not on the board."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		asChild: true,
		className: "mt-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SubjectHomeLink, {
			subject,
			children: ["Back to ", sub.name]
		})
	})] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SubjectHomeLink, {
			subject,
			className: "mb-6 inline-flex items-center gap-1.5 text-sm text-muted no-underline hover:text-ink",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), sub.name]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-4xl font-medium text-forest",
					children: strand.code
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 font-display text-3xl font-semibold tracking-tight",
					children: strand.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-xl text-ink-soft",
					children: strand.blurb
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-faint",
					children: strand.categoryLabel
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				size: "lg",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PracticeLink, {
					subject,
					teks: strand.id,
					children: ["Practice this strand", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
				})
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-2",
			children: ses.map((se) => {
				const stat = byTeks[se.id];
				const pct = accuracy(stat);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono text-sm font-medium tabular-nums text-forest",
										children: se.code
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: weightVariant(se.weight),
										children: weightLabel(se.weight)
									}),
									mounted && pct !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-xs tabular-nums text-muted",
										children: [
											stat.correct,
											"/",
											stat.attempted,
											" · ",
											pct,
											"%"
										]
									}) : null
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-1 font-display text-lg font-medium",
								children: se.kidTitle
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-0.5 text-sm text-muted",
								children: se.official
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "outline",
						className: "shrink-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PracticeLink, {
							subject,
							teks: se.id,
							children: "Practice"
						})
					})]
				}) }, se.id);
			})
		})
	] });
}
//#endregion
export { StrandBoard as t };
