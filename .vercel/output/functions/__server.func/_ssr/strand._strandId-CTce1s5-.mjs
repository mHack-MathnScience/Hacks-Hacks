import { y as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { i as isScienceTeks } from "./subjects-D31VD3Iu.mjs";
import { c as Route$6 } from "./router-B5VgnKaN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/strand._strandId-CTce1s5-.js
var import_jsx_runtime = require_jsx_runtime();
function LegacyStrand() {
	const { strandId } = Route$6.useParams();
	if (isScienceTeks(strandId)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
		to: "/science/strand/$strandId",
		params: { strandId },
		replace: true
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
		to: "/math/strand/$strandId",
		params: { strandId },
		replace: true
	});
}
//#endregion
export { LegacyStrand as component };
