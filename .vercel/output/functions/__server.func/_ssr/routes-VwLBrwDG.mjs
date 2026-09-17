import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { g as ArrowRight, m as Calculator, u as FlaskConical } from "../_libs/lucide-react.mjs";
import { i as useProgress, t as AppShell } from "./app-shell-Dqa0Wea-.mjs";
import { n as CardContent, t as Card } from "./card-Clcq4lIV.mjs";
import { t as Progress } from "./progress-DiV2CmPU.mjs";
import { i as isScienceTeks, t as SUBJECTS } from "./subjects-D31VD3Iu.mjs";
import { t as Button } from "./button-CwfzykdW.mjs";
import { t as Input } from "./input-RbfcTgbi.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-VwLBrwDG.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Hub() {
	useProgress((s) => s.name);
	const setName = useProgress((s) => s.setName);
	const byTeks = useProgress((s) => s.byTeks);
	const [mounted, setMounted] = (0, import_react.useState)(false);
	const [draft, setDraft] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		setMounted(true);
		setDraft(useProgress.getState().name);
	}, []);
	let mathAtt = 0;
	let mathCor = 0;
	let sciAtt = 0;
	let sciCor = 0;
	for (const [id, stat] of Object.entries(byTeks)) if (isScienceTeks(id)) {
		sciAtt += stat.attempted;
		sciCor += stat.correct;
	} else {
		mathAtt += stat.attempted;
		mathCor += stat.correct;
	}
	const overallAtt = mathAtt + sciAtt;
	const overallCor = mathCor + sciCor;
	const overall = overallAtt ? Math.round(overallCor / overallAtt * 100) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mb-8 grid gap-6 md:grid-cols-[1.4fr_0.8fr] md:items-end",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-2 text-xs font-medium tracking-[0.18em] text-forest uppercase",
					children: "Grade 5 · Texas TEKS"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl",
					children: "Hack’s Hacks"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 max-w-xl text-base text-ink-soft",
					children: "Math Hacks is generated TEKS practice. Science Hacks is the lab set — forces, landforms, circuits, and rocks — with a notebook and Check-it quiz."
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "flex flex-col gap-2",
				onSubmit: (e) => {
					e.preventDefault();
					setName(draft);
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					htmlFor: "student-name",
					className: "text-xs font-medium tracking-wide text-muted uppercase",
					children: "Name on this device"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "student-name",
						value: mounted ? draft : "",
						placeholder: "Optional",
						onChange: (e) => setDraft(e.target.value),
						autoComplete: "nickname"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						variant: "secondary",
						children: "Save"
					})]
				})]
			})]
		}),
		mounted && overall !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-6 flex items-center gap-3 text-sm text-muted",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "tabular-nums text-ink",
					children: [
						overallCor,
						"/",
						overallAtt,
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
			className: "grid gap-4 md:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubjectCard, {
				to: "/math",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calculator, { className: "size-5" }),
				name: SUBJECTS.math.name,
				range: "TEKS 5.2–5.10",
				blurb: "Place value, operations, volume, graphs, and financial literacy. A new question every time.",
				cta: "Open stations",
				filled: true,
				score: mounted && mathAtt ? `${Math.round(mathCor / mathAtt * 100)}%` : null
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubjectCard, {
				to: "/science",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlaskConical, { className: "size-5" }),
				name: SUBJECTS.science.name,
				range: "Labs · 5.7–5.10",
				blurb: "Sixteen labs, a scientist notebook, and a 21-item Check-it. Same classroom set as Science Hacks.",
				cta: "Open labs",
				filled: false,
				score: mounted && sciAtt ? `${Math.round(sciCor / sciAtt * 100)}%` : null
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-10 max-w-2xl text-xs leading-relaxed text-faint",
			children: "Math aligned to 19 TAC §111.7 (2012). Science labs follow the Grade 5 science TEKS implemented in 2024 (19 TAC §112.16). Progress is stored only on this device."
		})
	] });
}
function SubjectCard({ to, icon, name, range, blurb, cta, filled, score }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to,
		className: "group block no-underline",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: filled ? "h-full border-forest bg-forest text-bg transition-colors hover:bg-forest-deep" : "h-full transition-[border-color] duration-200 hover:border-line-strong",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "flex h-full flex-col p-6 sm:p-7",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: filled ? "text-chalk" : "text-forest",
							children: icon
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `text-xs tracking-[0.14em] uppercase ${filled ? "text-chalk" : "text-muted"}`,
							children: range
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-6 font-display text-3xl font-semibold tracking-tight",
						children: name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: `mt-2 flex-1 text-sm ${filled ? "text-chalk" : "text-muted"}`,
						children: blurb
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: `inline-flex items-center gap-1.5 text-sm font-medium ${filled ? "text-bg" : "text-forest"}`,
							children: [cta, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4 transition-transform group-hover:translate-x-0.5" })]
						}), score ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `text-xs tabular-nums ${filled ? "text-chalk" : "text-muted"}`,
							children: score
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `text-xs ${filled ? "text-chalk/80" : "text-faint"}`,
							children: "New"
						})]
					})
				]
			})
		})
	});
}
//#endregion
export { Hub as component };
