import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { s as Route$5 } from "./router-B5VgnKaN.mjs";
import { t as PracticeSession } from "./practice-session-DtkYVpB3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/math.practice._teks-CEawui9a.js
var import_jsx_runtime = require_jsx_runtime();
function MathPractice() {
	const { teks } = Route$5.useParams();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PracticeSession, {
		subject: "math",
		teks
	});
}
//#endregion
export { MathPractice as component };
