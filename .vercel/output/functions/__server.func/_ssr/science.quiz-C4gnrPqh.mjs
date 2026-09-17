import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as CardContent, t as Card } from "./card-Clcq4lIV.mjs";
import { t as Badge } from "./badge-Gu7_XEK4.mjs";
import { t as Button } from "./button-CwfzykdW.mjs";
import { r as ScienceShell } from "./science-shell-Ba2jLADM.mjs";
import { r as useLabStore } from "./lab-store-D1m1ljYL.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/science.quiz-C4gnrPqh.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var QUESTIONS = /* @__PURE__ */ JSON.parse("[{\"id\":\"q1\",\"prompt\":\"Two students push a crate from opposite sides with equal force. The crate is sitting still. What happens?\",\"teks\":\"5.7A\",\"choices\":[\"The crate speeds up toward the stronger student.\",\"The crate does not change its motion. It stays still.\",\"The crate floats because the forces cancel gravity.\",\"The crate always moves to the right.\"],\"answer\":1,\"why\":\"Equal forces in opposite directions are balanced. They do not change the crate's motion, so a crate at rest stays at rest.\"},{\"id\":\"q2\",\"prompt\":\"A student pushes a box to the right with 8 units of force. Friction pushes left with 3 units. What best describes the forces?\",\"teks\":\"5.7A\",\"choices\":[\"Equal forces — the box will not move.\",\"Unequal forces — the box speeds up to the right.\",\"Unequal forces — the box speeds up to the left.\",\"No forces are acting on the box.\"],\"answer\":1,\"why\":\"8 is greater than 3, so the forces are unequal. The box changes its motion in the direction of the larger force (right).\"},{\"id\":\"q3\",\"prompt\":\"A toy car rolls much farther on ice than on carpet. Which force is different?\",\"teks\":\"4.7A / 5.7B\",\"choices\":[\"Gravity is stronger on carpet.\",\"Magnetism pulls the car backward on carpet.\",\"Friction is greater on carpet, so it slows the car sooner.\",\"The car has more mass on ice.\"],\"answer\":2,\"why\":\"Friction opposes motion. Rough surfaces like carpet have more friction than ice, so the car loses energy of motion faster.\"},{\"id\":\"q4\",\"prompt\":\"Which force can act on an object without touching it?\",\"teks\":\"3.7A\",\"choices\":[\"Friction between a shoe and the floor\",\"A student pushing a swing\",\"Gravity pulling a dropped ball toward Earth\",\"Air pushing out of a balloon (only while it is touching the air inside)\"],\"answer\":2,\"why\":\"Gravity (and magnetism) can act at a distance. Friction and most pushes need contact.\"},{\"id\":\"q5\",\"prompt\":\"A student wants to test how ramp height affects how far a car travels. Which plan is a fair test?\",\"teks\":\"5.7B\",\"choices\":[\"Change the height, the car's mass, and the floor surface every trial.\",\"Change only the ramp height. Keep the same car, same mass, and same floor.\",\"Use a different car for each height so the test is more interesting.\",\"Measure the color of the car instead of the distance.\"],\"answer\":1,\"why\":\"A fair test changes only the independent variable (ramp height) and measures the dependent variable (distance). Everything else stays the same.\"},{\"id\":\"q6\",\"prompt\":\"Air rushes out the back of a balloon rocket. The rocket moves forward. Why?\",\"teks\":\"5.7A / 5.7B\",\"choices\":[\"Equal forces keep the balloon still, then gravity pulls it forward.\",\"The force of the air going backward is not balanced, so the balloon changes its motion forward.\",\"Friction on the string pulls the balloon forward.\",\"The string's magnetism pushes the balloon.\"],\"answer\":1,\"why\":\"The push of escaping air is an unequal force in the system. The balloon transfers energy and moves the other way along the string.\"},{\"id\":\"q7\",\"prompt\":\"A magnet holds a paper clip without touching it. This shows that magnetism is —\",\"teks\":\"3.7A / 4.7A\",\"choices\":[\"a contact force like friction\",\"the same as gravity, because both only push\",\"a force that can act at a distance\",\"not a force, because the objects do not touch\"],\"answer\":2,\"why\":\"Magnetism can attract or repel without contact. Gravity also acts at a distance, but gravity only pulls.\"},{\"id\":\"q8\",\"prompt\":\"As a crate speeds up, a student notices the energy-of-motion bar grows. What is happening?\",\"teks\":\"5.7A\",\"choices\":[\"Energy is being transferred to the crate as unequal forces change its motion.\",\"Energy is destroyed when the crate moves.\",\"Equal forces create energy from nothing.\",\"Friction is adding energy of motion.\"],\"answer\":0,\"why\":\"Unequal forces that move an object transfer energy. The moving crate has more energy of motion. Friction usually takes energy away.\"},{\"id\":\"q9\",\"prompt\":\"A deep V-shaped canyon with a river at the bottom was most likely formed by —\",\"teks\":\"5.10C\",\"choices\":[\"wind piling up sand\",\"running water eroding rock over a long time\",\"a glacier melting in one day\",\"sediment dropping where a river meets the ocean\"],\"answer\":1,\"why\":\"Canyons are usually cut by water. The river erodes rock and carries sediment away, carving a V-shaped valley that can become a canyon.\"},{\"id\":\"q10\",\"prompt\":\"A U-shaped valley is evidence that which agent once changed the land?\",\"teks\":\"5.10C\",\"choices\":[\"Wind depositing sand\",\"Only a flood that lasted one afternoon\",\"Ice — a glacier scraped the valley, even if the ice is gone now\",\"A river dropping sediment into the ocean\"],\"answer\":2,\"why\":\"Glaciers (ice) carve U-shaped valleys. The ice may no longer be there. The landform is the evidence.\"},{\"id\":\"q11\",\"prompt\":\"A river slows down where it meets the Gulf of Mexico and drops mud and sand. What landform is building?\",\"teks\":\"5.10C\",\"choices\":[\"A canyon\",\"A sand dune\",\"A U-shaped valley\",\"A delta\"],\"answer\":3,\"why\":\"A delta forms by deposition. When water slows, it cannot carry as much sediment, so the sediment drops and builds new land, often in a triangle.\"},{\"id\":\"q12\",\"prompt\":\"Monahans Sandhills in West Texas are hills of sand that slowly creep. What builds them?\",\"teks\":\"5.10C\",\"choices\":[\"Wind picking up sand and depositing it on a slip face\",\"A glacier scraping a U\",\"A river cutting a V through rock\",\"Equal forces on a crate\"],\"answer\":0,\"why\":\"Wind erodes sand from the gentle windward slope and deposits it on the steep slip face. That is how dunes form and migrate.\"},{\"id\":\"q13\",\"prompt\":\"A bulb, a battery, and wires are connected, but the bulb is dark. The switch is open. Why?\",\"teks\":\"5.8B\",\"choices\":[\"The battery has no chemical energy left, always.\",\"The path is not complete, so electrical energy cannot reach the load.\",\"Bulbs only work in space.\",\"Open switches add extra electrical energy.\"],\"answer\":1,\"why\":\"A functioning circuit needs a closed path. An open switch breaks the path, so the load does not receive electrical energy.\"},{\"id\":\"q14\",\"prompt\":\"Electrical energy in a complete circuit turns a fan. That energy was transformed into —\",\"teks\":\"5.8B\",\"choices\":[\"only chemical energy\",\"energy of motion\",\"a new kind of magnet that needs a touch\",\"weathering\"],\"answer\":1,\"why\":\"A motor or fan changes electrical energy into energy of motion. Other loads can make light, sound, or thermal energy.\"},{\"id\":\"q15\",\"prompt\":\"A student puts a rubber band in a gap in a circuit. The bulb stays dark. The rubber band is —\",\"teks\":\"5.6A / 5.8B\",\"choices\":[\"a conductor\",\"a source of chemical energy\",\"an insulator that blocks the path\",\"a load that makes sound\"],\"answer\":2,\"why\":\"Insulators such as rubber, wood, and plastic do not let electrical energy pass. The path stays incomplete.\"},{\"id\":\"q16\",\"prompt\":\"In a flashlight, energy changes from chemical energy in the battery to electrical energy to light. This is an example of —\",\"teks\":\"5.8A\",\"choices\":[\"energy transformation in a system\",\"equal forces canceling\",\"a U-shaped valley\",\"an insulator becoming a conductor\"],\"answer\":0,\"why\":\"5.8A: energy in a flashlight battery changes from chemical energy to electrical energy to light energy.\"},{\"id\":\"q17\",\"prompt\":\"A student has a battery, a light, and wires, but the light stays off. The wires do not touch the light. What is missing?\",\"teks\":\"5.8B\",\"choices\":[\"The parts are not connected into one closed path\",\"The light needs gravity to turn on\",\"Batteries only work on ramps\",\"A canyon must be in the circuit\"],\"answer\":0,\"why\":\"A functioning circuit needs a source, a load, and a closed path of conductors. The parts have to go together.\"},{\"id\":\"q18\",\"prompt\":\"A cliff cracks and pebbles fall, but they stay in a pile at the bottom. Which process is this?\",\"teks\":\"5.10B\",\"choices\":[\"Erosion, because the pebbles moved far away\",\"Weathering, because the rock broke into bits that stayed in place\",\"Cementation, because minerals glued the cliff\",\"A delta forming in the ocean\"],\"answer\":1,\"why\":\"Weathering breaks rock into sediment. Erosion is the next step — moving those bits to a new place.\"},{\"id\":\"q19\",\"prompt\":\"Which list shows the processes that form sedimentary rock in the correct order?\",\"teks\":\"5.10B\",\"choices\":[\"Cementation, compaction, deposition, erosion, weathering\",\"Weathering, erosion, deposition, compaction, cementation\",\"Erosion, cementation, weathering, deposition, compaction\",\"Deposition, weathering, compaction, erosion, cementation\"],\"answer\":1,\"why\":\"Break the rock (weathering), move it (erosion), drop it in layers (deposition), squeeze it (compaction), then glue it (cementation).\"},{\"id\":\"q20\",\"prompt\":\"Minerals seep between grains of sand and harden the layer into sandstone. This process is —\",\"teks\":\"5.10B\",\"choices\":[\"weathering\",\"erosion\",\"cementation\",\"a U-shaped valley\"],\"answer\":2,\"why\":\"Cementation is the glue. Compaction squeezes; cementation binds the grains into sedimentary rock.\"},{\"id\":\"q21\",\"prompt\":\"Coal, oil, and natural gas are found in sedimentary rock because —\",\"teks\":\"5.10B\",\"choices\":[\"magnets pulled them into the layers\",\"they fell from space last year\",\"remains of living things were buried in sediment and changed by heat and pressure over a long time\",\"weathering glues sand into oil\"],\"answer\":2,\"why\":\"Fossil fuels form when plants and other organisms are buried in sediment. Compaction, heat, and time change the remains. That is why they are found in sedimentary rock layers.\"}]");
var LETTERS = [
	"A",
	"B",
	"C",
	"D"
];
function QuizPage() {
	const saveQuiz = useLabStore((s) => s.saveQuiz);
	const saved = useLabStore((s) => s.quiz);
	const [mounted, setMounted] = (0, import_react.useState)(false);
	const [i, setI] = (0, import_react.useState)(0);
	const [picked, setPicked] = (0, import_react.useState)(null);
	const [answers, setAnswers] = (0, import_react.useState)(() => QUESTIONS.map(() => null));
	const [done, setDone] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setMounted(true), []);
	const q = QUESTIONS[i];
	const locked = picked !== null;
	const score = answers.reduce((n, a, idx) => n + (a === QUESTIONS[idx].answer ? 1 : 0), 0);
	function choose(n) {
		if (locked) return;
		setPicked(n);
		setAnswers((prev) => {
			const next = [...prev];
			next[i] = n;
			return next;
		});
	}
	function next() {
		if (i + 1 >= QUESTIONS.length) {
			const total = answers.map((a, idx) => idx === i ? picked : a).reduce((n, a, idx) => n + (a === QUESTIONS[idx].answer ? 1 : 0), 0);
			saveQuiz(total, QUESTIONS.length);
			setDone(true);
			return;
		}
		setI((n) => n + 1);
		setPicked(answers[i + 1]);
	}
	function restart() {
		setI(0);
		setPicked(null);
		setAnswers(QUESTIONS.map(() => null));
		setDone(false);
	}
	if (done) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ScienceShell, {
		className: "max-w-2xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium tracking-[0.16em] text-forest uppercase",
				children: "Check-it"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
				className: "mt-1 font-display text-4xl font-semibold tracking-tight",
				children: [
					"You scored ",
					score,
					" of ",
					QUESTIONS.length
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-ink-soft",
				children: score >= 16 ? "Strong grasp of forces, landforms, circuits, and rock processes." : score >= 10 ? "Solid start. Revisit the labs that match the items you missed." : "Walk back through the unit labs, then try again."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 space-y-3",
				children: QUESTIONS.map((item, idx) => {
					const pick = answers[idx];
					const ok = pick === item.answer;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm font-medium leading-snug",
							children: [
								idx + 1,
								". ",
								item.prompt
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: `mt-2 text-sm ${ok ? "text-good" : "text-bad"}`,
							children: [ok ? "Correct. " : `Your answer: ${item.choices[pick ?? 0]}. `, item.why]
						})]
					}) }, item.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-6",
				onClick: restart,
				children: "Try again"
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ScienceShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium tracking-[0.16em] text-forest uppercase",
				children: "Check it · STAAR-style"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "text-sm text-muted tabular-nums",
				children: [
					i + 1,
					" / ",
					QUESTIONS.length
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-faint",
			children: mounted && saved ? `Last score ${saved.score}/${saved.total}` : "No saved score yet"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
			className: "mt-4",
			children: q.teks
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mt-3 max-w-2xl font-display text-2xl font-semibold tracking-tight sm:text-3xl",
			children: q.prompt
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-6 grid gap-2",
			children: q.choices.map((choice, n) => {
				const isPick = picked === n;
				const isRight = locked && n === q.answer;
				const isWrong = locked && isPick && n !== q.answer;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => choose(n),
					className: `flex min-h-12 items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors ${isRight ? "border-good bg-good-soft text-ink" : isWrong ? "border-bad bg-bad-soft text-ink" : isPick ? "border-forest bg-forest-soft" : "border-line bg-surface hover:border-line-strong"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-7 shrink-0 place-items-center rounded-md bg-paper text-xs font-medium",
						children: LETTERS[n]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "pt-0.5",
						children: choice
					})]
				}, choice);
			})
		}),
		locked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "mt-5",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-wide text-muted uppercase",
						children: picked === q.answer ? "Correct" : "Not quite"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-ink-soft",
						children: q.why
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-4",
						onClick: next,
						children: i + 1 >= QUESTIONS.length ? "See score" : "Next"
					})
				]
			})
		}) : null
	] });
}
//#endregion
export { QuizPage as component };
