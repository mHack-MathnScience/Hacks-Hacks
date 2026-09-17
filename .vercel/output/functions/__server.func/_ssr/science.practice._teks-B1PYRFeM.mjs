import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { r as Route$1 } from "./router-B5VgnKaN.mjs";
import { t as PracticeSession } from "./practice-session-DtkYVpB3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/science.practice._teks-B1PYRFeM.js
var import_jsx_runtime = require_jsx_runtime();
function SciencePractice() {
	const { teks } = Route$1.useParams();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PracticeSession, {
		subject: "science",
		teks
	});
}
//#endregion
export { SciencePractice as component };
