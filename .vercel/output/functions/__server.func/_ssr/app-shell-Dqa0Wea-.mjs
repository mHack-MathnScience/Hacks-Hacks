import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { d as useRouterState, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { c as House, m as Calculator, p as ChartColumn, u as FlaskConical } from "../_libs/lucide-react.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app-shell-Dqa0Wea-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var empty = {
	name: "",
	byTeks: {},
	streak: 0,
	bestStreak: 0,
	totalCorrect: 0,
	totalAttempted: 0
};
var useProgress = create()(persist((set) => ({
	...empty,
	setName: (name) => set({ name: name.trim().slice(0, 32) }),
	record: (teks, correct) => set((state) => {
		const prev = state.byTeks[teks] ?? {
			attempted: 0,
			correct: 0,
			lastAt: 0
		};
		const streak = correct ? state.streak + 1 : 0;
		return {
			streak,
			bestStreak: Math.max(state.bestStreak, streak),
			totalAttempted: state.totalAttempted + 1,
			totalCorrect: state.totalCorrect + (correct ? 1 : 0),
			byTeks: {
				...state.byTeks,
				[teks]: {
					attempted: prev.attempted + 1,
					correct: prev.correct + (correct ? 1 : 0),
					lastAt: Date.now()
				}
			}
		};
	}),
	reset: () => set((state) => ({
		...empty,
		name: state.name
	}))
}), { name: "fifth-station-progress" }));
function accuracy(stat) {
	if (!stat || stat.attempted === 0) return null;
	return Math.round(stat.correct / stat.attempted * 100);
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function AppShell({ children, className }) {
	const name = useProgress((s) => s.name);
	const [mounted, setMounted] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setMounted(true), []);
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const onMath = pathname === "/math" || pathname.startsWith("/math/");
	const onScience = pathname === "/science" || pathname.startsWith("/science/");
	const onProgress = pathname === "/progress";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "sticky top-0 z-20 border-b border-line/80 bg-bg/90 backdrop-blur-md",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "flex items-baseline gap-2 no-underline",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display text-lg font-semibold italic tracking-tight text-forest",
						children: "Hack’s"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display text-lg font-medium tracking-tight text-ink",
						children: "Hacks"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
					className: "flex items-center gap-0.5",
					children: [
						mounted && name ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mr-2 hidden max-w-32 truncate text-xs text-muted sm:inline",
							children: name
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/",
							className: cn("inline-flex size-10 items-center justify-center rounded-md text-ink-soft hover:bg-paper hover:text-ink", pathname === "/" && "bg-paper text-ink"),
							"aria-label": "Home",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/math",
							className: cn("inline-flex size-10 items-center justify-center rounded-md text-ink-soft hover:bg-paper hover:text-ink", onMath && "bg-paper text-forest"),
							"aria-label": "Math Hacks",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calculator, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/science",
							className: cn("inline-flex size-10 items-center justify-center rounded-md text-ink-soft hover:bg-paper hover:text-ink", onScience && "bg-paper text-forest"),
							"aria-label": "Science Hacks",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlaskConical, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/progress",
							className: cn("inline-flex size-10 items-center justify-center rounded-md text-ink-soft hover:bg-paper hover:text-ink", onProgress && "bg-paper text-ink"),
							"aria-label": "Progress",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { className: "size-4" })
						})
					]
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			className: cn("mx-auto w-full max-w-5xl px-4 py-6 sm:py-8", className),
			children
		})]
	});
}
//#endregion
export { useProgress as i, accuracy as n, cn as r, AppShell as t };
