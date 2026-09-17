import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { _ as ArrowLeft, g as ArrowRight, s as Layers } from "../_libs/lucide-react.mjs";
import { i as useProgress, t as AppShell } from "./app-shell-Dqa0Wea-.mjs";
import { n as CardContent, t as Card } from "./card-Clcq4lIV.mjs";
import { t as Progress } from "./progress-DiV2CmPU.mjs";
import { r as getSubject } from "./subjects-D31VD3Iu.mjs";
import { n as StrandLink, t as PracticeLink } from "./subject-links--i5cpWl4.mjs";
import { t as Badge } from "./badge-Gu7_XEK4.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/subject-home-CPqd6DiS.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SubjectHome({ subject, framed = false }) {
	const sub = getSubject(subject);
	const byTeks = useProgress((s) => s.byTeks);
	const [mounted, setMounted] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setMounted(true), []);
	const ids = new Set(sub.expectations.map((e) => e.id));
	let attempted = 0;
	let correct = 0;
	for (const [id, stat] of Object.entries(byTeks)) {
		if (!ids.has(id)) continue;
		attempted += stat.attempted;
		correct += stat.correct;
	}
	const overall = attempted ? Math.round(correct / attempted * 100) : null;
	const body = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: framed && subject === "science" ? "/science" : "/",
			className: "mb-6 inline-flex items-center gap-1.5 text-sm text-muted no-underline hover:text-ink",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), framed && subject === "science" ? "Science Hacks" : "Hack’s Hacks"]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mb-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-2 text-xs font-medium tracking-[0.18em] text-forest uppercase",
					children: sub.kicker
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl",
					children: sub.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 max-w-xl text-base text-ink-soft",
					children: sub.tagline
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PracticeLink, {
			subject,
			teks: "staar",
			className: "mb-8 flex items-center justify-between gap-4 rounded-xl bg-forest px-5 py-5 text-bg no-underline transition-colors hover:bg-forest-deep",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-[0.16em] text-chalk uppercase",
					children: sub.mixKicker
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-2xl font-semibold",
					children: sub.mixTitle
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 max-w-md text-sm text-chalk",
					children: sub.mixBlurb
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-6 shrink-0" })]
		}),
		mounted && overall !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-6 flex items-center gap-3 text-sm text-muted",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "tabular-nums text-ink",
					children: [
						correct,
						"/",
						attempted,
						" correct"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
					value: overall,
					className: "max-w-40"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "tabular-nums",
					children: [overall, "%"]
				})
			]
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-3 flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-lg font-medium",
				children: "Stations"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "text-xs text-muted",
				children: [sub.expectations.length, " student expectations"]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
			children: sub.strands.map((strand) => {
				const ses = sub.expectationsForStrand(strand.id);
				const att = ses.reduce((n, se) => n + (byTeks[se.id]?.attempted ?? 0), 0);
				const cor = ses.reduce((n, se) => n + (byTeks[se.id]?.correct ?? 0), 0);
				const pct = att ? Math.round(cor / att * 100) : null;
				const ready = ses.filter((s) => s.weight === "readiness").length;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StrandLink, {
					subject,
					strandId: strand.id,
					className: "group block no-underline",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "h-full transition-[border-color,transform] duration-200 hover:border-line-strong",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "flex h-full flex-col p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-display text-3xl font-medium tracking-tight text-forest",
										children: strand.code
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "size-4 text-faint transition-colors group-hover:text-forest" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "mt-3 font-display text-xl font-medium",
									children: strand.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 flex-1 text-sm text-muted",
									children: strand.blurb
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-4 flex items-center justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
											variant: "supporting",
											children: [ses.length, " TEKS"]
										}), ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
											variant: "readiness",
											children: [ready, " readiness"]
										}) : null]
									}), mounted && pct !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-xs tabular-nums text-muted",
										children: [pct, "%"]
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-faint",
										children: "New"
									})]
								})
							]
						})
					})
				}, strand.id);
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-10 max-w-2xl text-xs leading-relaxed text-faint",
			children: sub.footer
		})
	] });
	if (framed) return body;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: body });
}
//#endregion
export { SubjectHome as t };
