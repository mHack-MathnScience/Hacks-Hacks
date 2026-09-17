import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { _ as ArrowLeft, f as Check, g as ArrowRight, i as RotateCcw, n as X } from "../_libs/lucide-react.mjs";
import { i as useProgress, r as cn, t as AppShell } from "./app-shell-Dqa0Wea-.mjs";
import { n as CardContent, t as Card } from "./card-Clcq4lIV.mjs";
import { t as Progress } from "./progress-DiV2CmPU.mjs";
import { a as parseFrac, n as fracsEqual, o as stripVulgar, r as getSubject } from "./subjects-D31VD3Iu.mjs";
import { n as StrandLink, r as SubjectHomeLink } from "./subject-links--i5cpWl4.mjs";
import { t as Badge } from "./badge-Gu7_XEK4.mjs";
import { t as Button } from "./button-CwfzykdW.mjs";
import { t as Input } from "./input-RbfcTgbi.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/practice-session-DtkYVpB3.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function QuestionVisual({ visual }) {
	switch (visual.kind) {
		case "grid10": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid10, {
			cols: visual.cols,
			rows: visual.rows
		});
		case "tenth-bar": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TenthBar, {
			totalTenths: visual.totalTenths,
			groupTenths: visual.groupTenths
		});
		case "fraction-bars": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FractionBars, { bars: visual.bars });
		case "number-line": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberLine, { visual });
		case "prism": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Prism, {
			l: visual.l,
			w: visual.w,
			h: visual.h
		});
		case "cubes": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cubes, {
			l: visual.l,
			w: visual.w,
			h: visual.h
		});
		case "coordinate": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coordinate, { visual });
		case "bar": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BarChart, { visual });
		case "dots": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DotPlot, { visual });
		case "stemleaf": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StemLeaf, { visual });
		case "scatter": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scatter, { visual });
		case "table": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, { visual });
		case "shape": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shape, { figure: visual.figure });
		default: return null;
	}
}
function Panel({ children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("overflow-hidden rounded-lg border border-line bg-paper/60 p-3 sm:p-4", className),
		children
	});
}
function Grid10({ cols, rows }) {
	const cells = [];
	for (let r = 0; r < 10; r++) for (let c = 0; c < 10; c++) {
		const inCol = c < cols;
		const inRow = r < rows;
		const overlap = inCol && inRow;
		cells.push(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("aspect-square border border-line", overlap ? "bg-forest/55" : inCol ? "bg-forest/20" : inRow ? "bg-ink/10" : "bg-surface") }, `${r}-${c}`));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-2 text-xs font-medium uppercase tracking-wide text-muted",
			children: "10-by-10 hundredths grid"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mx-auto grid max-w-64 grid-cols-10 overflow-hidden rounded-sm border border-line-strong",
			children: cells
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-2 text-center text-xs text-muted",
			children: [
				cols,
				" tenths × ",
				rows,
				" tenths"
			]
		})
	] });
}
function TenthBar({ totalTenths, groupTenths }) {
	const cells = Array.from({ length: totalTenths }, (_, i) => {
		const group = Math.floor(i / groupTenths);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("h-10 flex-1 border-r border-line last:border-r-0", group % 2 === 0 ? "bg-forest/35" : "bg-forest/15") }, i);
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-2 text-xs font-medium uppercase tracking-wide text-muted",
			children: "Decimal bar (tenths)"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex overflow-hidden rounded-sm border border-line-strong",
			children: cells
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-2 text-center text-xs text-muted",
			children: [
				(totalTenths / 10).toFixed(1),
				" grouped by ",
				(groupTenths / 10).toFixed(1)
			]
		})
	] });
}
function FractionBars({ bars }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
		className: "space-y-3",
		children: bars.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-1 flex justify-between text-xs text-muted",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: b.label }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
				b.num,
				"/",
				b.den
			] })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex h-7 overflow-hidden rounded-sm border border-line-strong",
			children: Array.from({ length: b.den }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("h-full flex-1 border-r border-line last:border-r-0", i < b.num ? "bg-forest/45" : "bg-surface") }, i))
		})] }, `${b.label}-${b.den}`))
	});
}
function NumberLine({ visual }) {
	const ticks = [];
	for (let t = visual.min; t <= visual.max + 1e-9; t += visual.tick) ticks.push(Number(t.toFixed(3)));
	const pct = (visual.mark - visual.min) / (visual.max - visual.min) * 100;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative mx-2 mt-6 mb-2 h-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute top-6 right-0 left-0 h-px bg-ink" }),
			ticks.map((t) => {
				const p = (t - visual.min) / (visual.max - visual.min) * 100;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute top-5",
					style: { left: `${p}%` },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-3 w-px bg-ink" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "-translate-x-1/2 pt-1 font-mono text-[10px] text-muted",
						children: t
					})]
				}, t);
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute top-0",
				style: { left: `${pct}%` },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "-translate-x-1/2 text-xs font-medium text-forest",
					children: visual.label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-auto mt-0.5 size-2.5 rounded-full bg-forest" })]
			})
		]
	}) });
}
function Prism({ l, w, h }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		className: "flex flex-col items-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			viewBox: "0 0 220 160",
			className: "h-36 w-full max-w-xs text-ink",
			"aria-hidden": true,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
					points: "70,30 160,30 190,55 160,90 70,90 100,55",
					fill: "var(--color-surface)",
					stroke: "currentColor",
					strokeWidth: "1.4"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
					points: "160,30 190,55 190,115 160,90",
					fill: "var(--color-forest-soft)",
					stroke: "currentColor",
					strokeWidth: "1.4"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
					points: "70,90 160,90 190,115 100,115",
					fill: "var(--color-paper)",
					stroke: "currentColor",
					strokeWidth: "1.4"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
					points: "70,30 160,30 160,90 70,90",
					fill: "var(--color-surface)",
					stroke: "currentColor",
					strokeWidth: "1.4"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
					x: "115",
					y: "64",
					textAnchor: "middle",
					fontSize: "12",
					fill: "currentColor",
					children: l
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
					x: "178",
					y: "80",
					textAnchor: "middle",
					fontSize: "12",
					fill: "currentColor",
					children: w
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
					x: "52",
					y: "66",
					textAnchor: "middle",
					fontSize: "12",
					fill: "currentColor",
					children: h
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-xs text-muted",
			children: [
				l,
				" × ",
				w,
				" × ",
				h
			]
		})]
	});
}
function Cubes({ l, w, h }) {
	const showGrid = l * w <= 24 && h <= 6;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mb-2 text-xs font-medium uppercase tracking-wide text-muted",
			children: [
				h,
				" layers of ",
				l,
				" × ",
				w
			]
		}),
		showGrid ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-col items-center gap-1",
			children: Array.from({ length: Math.min(h, 5) }, (_, layer) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-px",
				style: { gridTemplateColumns: `repeat(${l}, 1.1rem)` },
				children: Array.from({ length: l * w }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-[1.1rem] rounded-[2px] border border-forest/40 bg-forest/25" }, i))
			}, layer))
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "font-display text-2xl text-forest",
			children: [
				l,
				" × ",
				w,
				" × ",
				h
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-2 text-center text-xs text-muted",
			children: [
				l * w,
				" unit cubes in each layer × ",
				h,
				" layers"
			]
		})
	] });
}
function Coordinate({ visual }) {
	const size = 10;
	const pad = 28;
	const box = 240;
	const scale = (box - pad * 1.2) / size;
	const toX = (x) => pad + x * scale;
	const toY = (y) => 212 - y * scale;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
		className: "flex justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			viewBox: `0 0 ${box} ${box}`,
			className: "h-56 w-56 text-ink",
			role: "img",
			"aria-label": "Coordinate plane",
			children: [
				Array.from({ length: 11 }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: toX(i),
						y1: toY(0),
						x2: toX(i),
						y2: toY(size),
						stroke: "currentColor",
						strokeOpacity: "0.12"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: toX(0),
						y1: toY(i),
						x2: toX(size),
						y2: toY(i),
						stroke: "currentColor",
						strokeOpacity: "0.12"
					}),
					i > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
						x: toX(i),
						y: toY(0) + 14,
						textAnchor: "middle",
						fontSize: "9",
						fill: "currentColor",
						opacity: "0.55",
						children: i
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
						x: toX(0) - 10,
						y: toY(i) + 3,
						textAnchor: "middle",
						fontSize: "9",
						fill: "currentColor",
						opacity: "0.55",
						children: i
					})] })
				] }, i)),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: toX(0),
					y1: toY(0),
					x2: toX(size),
					y2: toY(0),
					stroke: "currentColor",
					strokeWidth: "1.5"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: toX(0),
					y1: toY(0),
					x2: toX(0),
					y2: toY(size),
					stroke: "currentColor",
					strokeWidth: "1.5"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
					x: toX(size) + 8,
					y: toY(0) + 4,
					fontSize: "11",
					fill: "currentColor",
					children: "x"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
					x: toX(0) - 4,
					y: toY(size) - 8,
					fontSize: "11",
					fill: "currentColor",
					textAnchor: "middle",
					children: "y"
				}),
				visual.points.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: toX(p.x),
					cy: toY(p.y),
					r: 5,
					fill: "var(--color-forest)"
				}), p.label && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
					x: toX(p.x) + 8,
					y: toY(p.y) - 8,
					fontSize: "11",
					fill: "currentColor",
					children: p.label
				})] }, `${p.x}-${p.y}`))
			]
		})
	});
}
function BarChart({ visual }) {
	const max = Math.max(...visual.bars.map((b) => b.value), 1);
	const yMax = Math.ceil(max / 5) * 5 || 5;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-3 font-display text-sm",
			children: visual.title
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-2",
			children: visual.bars.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-[6.5rem_1fr_2rem] items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "truncate text-xs text-ink-soft capitalize",
						children: b.label
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-4 rounded-sm bg-paper",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-4 rounded-sm bg-forest/70",
							style: { width: `${b.value / yMax * 100}%` }
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-right font-mono text-xs tabular-nums",
						children: b.value
					})
				]
			}, b.label))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-xs text-muted",
			children: visual.unit
		})
	] });
}
function DotPlot({ visual }) {
	const min = Math.min(...visual.values, 0);
	const max = Math.max(...visual.values, 1);
	const lo = Math.min(min, 0);
	const hi = max;
	const counts = /* @__PURE__ */ new Map();
	for (const v of visual.values) counts.set(v, (counts.get(v) ?? 0) + 1);
	const ticks = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-2 font-display text-sm",
			children: visual.title
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex items-end gap-1 overflow-x-auto pb-1",
			children: ticks.map((t) => {
				const n = counts.get(t) ?? 0;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-7 flex-1 flex-col items-center justify-end",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-col-reverse gap-0.5 pb-1",
							children: Array.from({ length: n }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-2.5 rounded-full bg-forest" }, i))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-px w-full bg-ink/30" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "pt-1 font-mono text-[10px] text-muted",
							children: t
						})
					]
				}, t);
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-xs text-muted",
			children: visual.unit
		})
	] });
}
function StemLeaf({ visual }) {
	const map = /* @__PURE__ */ new Map();
	for (const n of visual.data) {
		const stem = Math.floor(n / 10);
		const leaf = n % 10;
		const arr = map.get(stem) ?? [];
		arr.push(leaf);
		map.set(stem, arr);
	}
	const stems = [...map.keys()].sort((a, b) => a - b);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-2 font-display text-sm",
			children: visual.title
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "text-left text-xs text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
					className: "pr-4 font-medium",
					children: "Stem"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
					className: "font-medium",
					children: "Leaf"
				})]
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
				className: "font-mono tabular-nums",
				children: stems.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-t border-line",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "py-1 pr-4",
						children: s
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "py-1",
						children: (map.get(s) ?? []).sort((a, b) => a - b).join(" ")
					})]
				}, s))
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-2 text-xs text-muted",
			children: ["Key: 2 | 4 means 24 ", visual.unit]
		})
	] });
}
function Scatter({ visual }) {
	const box = 240;
	const pad = 28;
	const inner = box - pad * 1.4;
	const toX = (x) => pad + x / 10 * inner;
	const toY = (y) => 212 - y / 10 * inner;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		className: "flex flex-col items-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-1 self-start font-display text-sm",
			children: visual.title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			viewBox: `0 0 ${box} ${box}`,
			className: "h-52 w-52 text-ink",
			role: "img",
			"aria-label": "Scatterplot",
			children: [
				Array.from({ length: 11 }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: toX(i),
					y1: toY(0),
					x2: toX(i),
					y2: toY(10),
					stroke: "currentColor",
					strokeOpacity: "0.1"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: toX(0),
					y1: toY(i),
					x2: toX(10),
					y2: toY(i),
					stroke: "currentColor",
					strokeOpacity: "0.1"
				})] }, i)),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: toX(0),
					y1: toY(0),
					x2: toX(10),
					y2: toY(0),
					stroke: "currentColor"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: toX(0),
					y1: toY(0),
					x2: toX(0),
					y2: toY(10),
					stroke: "currentColor"
				}),
				visual.points.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: toX(p.x),
					cy: toY(p.y),
					r: 4,
					fill: "var(--color-forest)",
					fillOpacity: "0.85"
				}, i)),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
					x: box / 2,
					y: 234,
					textAnchor: "middle",
					fontSize: "10",
					fill: "currentColor",
					children: visual.xLabel
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
					x: 12,
					y: 16,
					fontSize: "10",
					fill: "currentColor",
					children: visual.yLabel
				})
			]
		})]
	});
}
function DataTable({ visual }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [visual.caption && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mb-2 font-display text-sm",
		children: visual.caption
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-x-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: visual.headers.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
				className: "border-b border-line px-2 py-1.5 text-left text-xs font-medium text-muted",
				children: h
			}, h)) }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: visual.rows.map((row, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
				className: "border-b border-line/70",
				children: row.map((cell, j) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					className: "px-2 py-1.5 font-mono tabular-nums",
					children: cell
				}, j))
			}, i)) })]
		})
	})] });
}
function Shape({ figure }) {
	const common = {
		fill: "var(--color-forest-soft)",
		stroke: "var(--color-forest)",
		strokeWidth: 2
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		className: "flex flex-col items-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			viewBox: "0 0 120 90",
			className: "h-24 w-32",
			"aria-hidden": true,
			children: [
				figure === "square" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: "30",
					y: "15",
					width: "60",
					height: "60",
					...common
				}),
				figure === "rectangle" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: "18",
					y: "28",
					width: "84",
					height: "40",
					...common
				}),
				figure === "rhombus" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
					points: "60,12 108,45 60,78 12,45",
					...common
				}),
				figure === "parallelogram" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
					points: "28,22 108,22 92,72 12,72",
					...common
				}),
				figure === "trapezoid" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
					points: "32,24 88,24 108,72 12,72",
					...common
				}),
				figure === "isosceles" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
					points: "60,14 104,76 16,76",
					...common
				}),
				![
					"square",
					"rectangle",
					"rhombus",
					"parallelogram",
					"trapezoid",
					"isosceles"
				].includes(figure) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
					points: "60,14 104,76 16,76",
					...common
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs capitalize text-muted",
			children: figure
		})]
	});
}
function normalizeText(raw) {
	return stripVulgar(raw).trim().replace(/\$/g, "").replace(/,/g, "").replace(/\s+/g, " ").replace(/×/g, "x").replace(/·/g, "x").replace(/÷/g, "/").toLowerCase();
}
function answersMatch(given, correct, accept = []) {
	const candidates = [correct, ...accept];
	const g = given.trim();
	if (!g) return false;
	for (const c of candidates) {
		if (normalizeText(g) === normalizeText(c)) return true;
		if (fracsEqual(g, c)) return true;
		const pg = parseFrac(g);
		const pc = parseFrac(c);
		if (pg && pc && pg.n * pc.d === pc.n * pg.d) return true;
		const ng = Number(normalizeText(g));
		const nc = Number(normalizeText(c));
		if (Number.isFinite(ng) && Number.isFinite(nc) && Math.abs(ng - nc) < 1e-8) return true;
	}
	return false;
}
var SET_SIZE = 8;
function PracticeSession({ subject, teks }) {
	const sub = getSubject(subject);
	const pool = sub.poolForKey(teks);
	const label = sub.labelForKey(teks);
	const isMix = teks === "staar" || teks === "mix";
	const record = useProgress((s) => s.record);
	const [set, setSet] = (0, import_react.useState)(null);
	const [index, setIndex] = (0, import_react.useState)(0);
	const [selected, setSelected] = (0, import_react.useState)(null);
	const [typed, setTyped] = (0, import_react.useState)("");
	const [checked, setChecked] = (0, import_react.useState)(false);
	const [correctCount, setCorrectCount] = (0, import_react.useState)(0);
	const [done, setDone] = (0, import_react.useState)(false);
	const [round, setRound] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		if (pool.length === 0) return;
		setSet(sub.generateSet(teks, SET_SIZE));
		setIndex(0);
		setSelected(null);
		setTyped("");
		setChecked(false);
		setCorrectCount(0);
		setDone(false);
	}, [
		teks,
		round,
		pool.length,
		sub
	]);
	const q = set?.[index] ?? null;
	const se = q ? sub.expectationById(q.teks) : sub.expectationById(teks);
	const strand = se ? sub.strandById(se.strandId) : sub.strandById(teks);
	const isCorrect = (0, import_react.useMemo)(() => {
		if (!q || !checked) return false;
		if (q.kind === "mc") return selected === q.correct;
		return answersMatch(typed, q.correct, q.accept);
	}, [
		q,
		checked,
		selected,
		typed
	]);
	function check() {
		if (!q || checked) return;
		const ok = q.kind === "mc" ? selected === q.correct : answersMatch(typed, q.correct, q.accept);
		setChecked(true);
		if (ok) setCorrectCount((n) => n + 1);
		record(q.teks, ok);
	}
	function next() {
		if (!set) return;
		if (index + 1 >= set.length) {
			setDone(true);
			return;
		}
		setIndex((i) => i + 1);
		setSelected(null);
		setTyped("");
		setChecked(false);
	}
	(0, import_react.useEffect)(() => {
		function onKey(e) {
			if (!q || done) return;
			const tag = e.target?.tagName;
			if (tag === "INPUT" || tag === "TEXTAREA") {
				if (e.key === "Enter") {
					e.preventDefault();
					if (checked) next();
					else check();
				}
				return;
			}
			if (!checked && q.kind === "mc" && q.choices) {
				const id = {
					"1": "A",
					"2": "B",
					"3": "C",
					"4": "D"
				}[e.key];
				if (id && q.choices.some((c) => c.id === id)) setSelected(id);
			}
			if (e.key === "Enter") {
				e.preventDefault();
				if (checked) next();
				else check();
			}
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	});
	if (pool.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-ink-soft",
		children: "No questions for that TEKS yet."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		asChild: true,
		className: "mt-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SubjectHomeLink, {
			subject,
			children: ["Back to ", sub.name]
		})
	})] });
	if (!set || !q) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-muted",
		children: "Shuffling a new set…"
	}) });
	if (done) {
		const pct = Math.round(correctCount / set.length * 100);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
			className: "max-w-xl",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "p-6 sm:p-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.16em] text-forest uppercase",
						children: label.kicker
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-2 font-display text-3xl font-semibold",
						children: "Set complete"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 font-display text-5xl tabular-nums text-forest",
						children: [correctCount, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-2xl text-muted",
							children: ["/", set.length]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-ink-soft",
						children: [
							pct,
							"% on this set of ",
							label.title,
							"."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
						value: pct,
						className: "mt-4"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 flex flex-col gap-2 sm:flex-row",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: () => setRound((n) => n + 1),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-4" }), "New set"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "secondary",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubjectHomeLink, {
									subject,
									children: sub.name
								})
							}),
							strand ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "ghost",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StrandLink, {
									subject,
									strandId: strand.id,
									children: strand.title
								})
							}) : null
						]
					})
				]
			}) })
		});
	}
	const canCheck = q.kind === "mc" ? Boolean(selected) : typed.trim().length > 0;
	const progressPct = (index + (checked ? 1 : 0)) / set.length * 100;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		className: "max-w-3xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex items-center justify-between gap-3",
				children: [isMix ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SubjectHomeLink, {
					subject,
					className: "inline-flex items-center gap-1.5 text-sm text-muted no-underline hover:text-ink",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), sub.name]
				}) : strand ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(StrandLink, {
					subject,
					strandId: strand.id,
					className: "inline-flex items-center gap-1.5 text-sm text-muted no-underline hover:text-ink",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), strand.title]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SubjectHomeLink, {
					subject,
					className: "inline-flex items-center gap-1.5 text-sm text-muted no-underline hover:text-ink",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), sub.name]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "font-mono text-xs tabular-nums text-muted",
					children: [
						index + 1,
						" / ",
						set.length
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
				value: progressPct,
				className: "mb-5"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "default",
						children: se?.code ?? label.kicker
					}),
					se?.weight === "readiness" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "readiness",
						children: "Readiness"
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm text-muted",
						children: se?.kidTitle ?? label.title
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "p-5 sm:p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-lg leading-relaxed text-ink",
						children: q.stem
					}),
					q.expression ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 font-display text-3xl tracking-tight text-forest sm:text-4xl",
						children: q.expression
					}) : null,
					q.visual ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuestionVisual, { visual: q.visual })
					}) : null,
					q.kind === "mc" && q.choices ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-6 grid gap-2",
						role: "listbox",
						"aria-label": "Answer choices",
						children: q.choices.map((c) => {
							const isSel = selected === c.id;
							const isAns = c.id === q.correct;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								disabled: checked,
								onClick: () => setSelected(c.id),
								className: cn("flex min-h-12 items-start gap-3 rounded-lg border px-3 py-3 text-left transition-colors", !checked && "hover:border-line-strong hover:bg-paper", !checked && isSel && "border-forest bg-forest-soft", checked && isAns && "border-good bg-good-soft", checked && isSel && !isAns && "border-bad bg-bad-soft", checked && !isSel && !isAns && "opacity-60"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-sm border font-mono text-xs", checked && isAns && "border-good bg-good text-bg", checked && isSel && !isAns && "border-bad bg-bad text-bg", !checked && isSel && "border-forest bg-forest text-bg", !checked && !isSel && "border-line bg-surface text-muted"),
									children: c.id
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "pt-0.5 text-base leading-snug",
									children: c.text
								})]
							}, c.id);
						})
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							htmlFor: "answer",
							className: "mb-1.5 block text-xs font-medium tracking-wide text-muted uppercase",
							children: "Your answer"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "answer",
							value: typed,
							onChange: (e) => setTyped(e.target.value),
							placeholder: q.inputHint,
							disabled: checked,
							autoComplete: "off",
							inputMode: "decimal",
							className: cn("max-w-xs font-mono text-lg", checked && isCorrect && "border-good bg-good-soft", checked && !isCorrect && "border-bad bg-bad-soft")
						})]
					}),
					checked ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: cn("mt-5 rounded-lg border px-4 py-3", isCorrect ? "border-good/30 bg-good-soft" : "border-bad/30 bg-bad-soft"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "flex items-center gap-2 text-sm font-medium",
								children: [isCorrect ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4 text-good" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4 text-bad" }), isCorrect ? "That’s it." : "Not quite."]
							}),
							!isCorrect && q.kind === "input" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-sm text-ink-soft",
								children: ["Correct answer: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium text-ink",
									children: q.correct
								})]
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm leading-relaxed text-ink-soft",
								children: q.explanation
							})
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 hidden text-xs text-faint sm:block",
						children: q.kind === "mc" ? "Press 1–4 to choose, Enter to check." : "Press Enter to check."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-6 flex flex-wrap gap-2",
						children: !checked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: check,
							disabled: !canCheck,
							children: "Check"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: next,
							children: [index + 1 >= set.length ? "See results" : "Next", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
						})
					})
				]
			}) })
		]
	});
}
//#endregion
export { PracticeSession as t };
