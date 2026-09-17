import { y as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { i as isScienceTeks } from "./subjects-D31VD3Iu.mjs";
import { l as Route$12 } from "./router-B5VgnKaN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/practice._teks-EtasXDoa.js
var import_jsx_runtime = require_jsx_runtime();
function LegacyPractice() {
	const { teks } = Route$12.useParams();
	if (isScienceTeks(teks)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
		to: "/science/practice/$teks",
		params: { teks },
		replace: true
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
		to: "/math/practice/$teks",
		params: { teks },
		replace: true
	});
}
//#endregion
export { LegacyPractice as component };
