import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { _ as ArrowLeft } from "../_libs/lucide-react.mjs";
import { i as useProgress, n as accuracy, t as AppShell } from "./app-shell-Dqa0Wea-.mjs";
import { n as CardContent, t as Card } from "./card-Clcq4lIV.mjs";
import { t as Progress } from "./progress-DiV2CmPU.mjs";
import { t as SUBJECTS } from "./subjects-D31VD3Iu.mjs";
import { t as PracticeLink } from "./subject-links--i5cpWl4.mjs";
import { t as Badge } from "./badge-Gu7_XEK4.mjs";
import { t as Button } from "./button-CwfzykdW.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/progress-BJoBg6xi.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProgressPage() {
	const name = useProgress((s) => s.name);
	const byTeks = useProgress((s) => s.byTeks);
	const streak = useProgress((s) => s.streak);
	const bestStreak = useProgress((s) => s.bestStreak);
	const totalCorrect = useProgress((s) => s.totalCorrect);
	const totalAttempted = useProgress((s) => s.totalAttempted);
	const reset = useProgress((s) => s.reset);
	const [mounted, setMounted] = (0, import_react.useState)(false);
	const [confirm, setConfirm] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setMounted(true), []);
	const overall = totalAttempted ? Math.round(totalCorrect / totalAttempted * 100) : 0;
	const mathPracticed = SUBJECTS.math.expectations.filter((e) => (byTeks[e.id]?.attempted ?? 0) > 0).length;
	const sciPracticed = SUBJECTS.science.expectations.filter((e) => (byTeks[e.id]?.attempted ?? 0) > 0).length;
	const totalSe = SUBJECTS.math.expectations.length + SUBJECTS.science.expectations.length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: "/",
			className: "mb-6 inline-flex items-center gap-1.5 text-sm text-muted no-underline hover:text-ink",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), "Hack’s Hacks"]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-3xl font-semibold tracking-tight",
			children: mounted && name ? `${name}’s progress` : "Progress"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted",
			children: "Stored on this device only."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 grid gap-3 sm:grid-cols-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Answered",
					value: mounted ? String(totalAttempted) : "—"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Accuracy",
					value: mounted && totalAttempted ? `${overall}%` : "—"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Streak",
					value: mounted ? `${streak} · best ${bestStreak}` : "—"
				})
			]
		}),
		mounted && totalAttempted > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
			value: overall,
			className: "mt-4"
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-xs text-muted",
			children: mounted ? `${mathPracticed + sciPracticed} of ${totalSe} student expectations practiced · Math ${mathPracticed}/${SUBJECTS.math.expectations.length} · Science ${sciPracticed}/${SUBJECTS.science.expectations.length}` : ""
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubjectProgress, { subject: "math" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubjectProgress, { subject: "science" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-10",
			children: !confirm ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				onClick: () => setConfirm(true),
				children: "Reset progress"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm text-muted",
						children: "Clear all scores on this device?"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "danger",
						size: "sm",
						onClick: () => {
							reset();
							setConfirm(false);
						},
						children: "Reset"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "sm",
						onClick: () => setConfirm(false),
						children: "Keep"
					})
				]
			})
		})
	] });
}
function SubjectProgress({ subject }) {
	const sub = SUBJECTS[subject];
	const byTeks = useProgress((s) => s.byTeks);
	const [mounted, setMounted] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setMounted(true), []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl font-semibold tracking-tight",
				children: sub.name
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted",
				children: sub.kicker
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 space-y-8",
				children: sub.strands.map((strand) => {
					const ses = sub.expectationsForStrand(strand.id);
					const att = ses.reduce((n, se) => n + (byTeks[se.id]?.attempted ?? 0), 0);
					const cor = ses.reduce((n, se) => n + (byTeks[se.id]?.correct ?? 0), 0);
					const pct = att ? Math.round(cor / att * 100) : 0;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-2 flex items-baseline justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
							className: "font-display text-xl",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-forest",
									children: strand.code
								}),
								" ",
								strand.title
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs tabular-nums text-muted",
							children: att ? `${pct}%` : "Not started"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "divide-y divide-line rounded-xl border border-line bg-surface",
						children: ses.map((se) => {
							const stat = byTeks[se.id];
							const a = accuracy(stat);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3 px-4 py-2.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "w-16 shrink-0 font-mono text-xs text-forest",
										children: se.code
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "min-w-0 flex-1 truncate text-sm",
										children: se.kidTitle
									}),
									se.weight === "readiness" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "readiness",
										children: "R"
									}) : null,
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "w-16 text-right text-xs tabular-nums text-muted",
										children: mounted && a !== null ? `${a}%` : "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										asChild: true,
										size: "sm",
										variant: "ghost",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PracticeLink, {
											subject,
											teks: se.id,
											children: "Go"
										})
									})
								]
							}, se.id);
						})
					})] }, strand.id);
				})
			})
		]
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
		className: "p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs tracking-wide text-muted uppercase",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 font-display text-2xl tabular-nums",
			children: value
		})]
	}) });
}
//#endregion
export { ProgressPage as component };
