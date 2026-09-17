import { n as create, t as persist } from "../_libs/zustand.mjs";
import { t as LABS } from "./science-shell-Ba2jLADM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/lab-store-D1m1ljYL.js
var emptyRec = () => ({
	finished: false,
	claim: "",
	trials: []
});
var useLabStore = create()(persist((set) => ({
	byLab: {},
	quiz: null,
	markFinished: (id) => set((s) => ({ byLab: {
		...s.byLab,
		[id]: {
			...s.byLab[id] ?? emptyRec(),
			finished: true
		}
	} })),
	saveClaim: (id, claim) => set((s) => ({ byLab: {
		...s.byLab,
		[id]: {
			...s.byLab[id] ?? emptyRec(),
			claim: claim.trim().slice(0, 400)
		}
	} })),
	addTrial: (id, trial) => set((s) => {
		const prev = s.byLab[id] ?? emptyRec();
		return { byLab: {
			...s.byLab,
			[id]: {
				...prev,
				trials: [...prev.trials, trial].slice(-12)
			}
		} };
	}),
	saveQuiz: (score, total) => set({ quiz: {
		score,
		total,
		at: Date.now()
	} }),
	resetLabs: () => set({
		byLab: {},
		quiz: null
	})
}), { name: "hacks-hacks-science-labs" }));
function labRecord(byLab, id) {
	return byLab[id] ?? emptyRec();
}
function finishedCount(byLab) {
	return LABS.filter((l) => byLab[l.id]?.finished).length;
}
//#endregion
export { labRecord as n, useLabStore as r, finishedCount as t };
