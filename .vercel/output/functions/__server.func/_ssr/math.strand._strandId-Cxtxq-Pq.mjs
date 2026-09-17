import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { o as Route$4 } from "./router-B5VgnKaN.mjs";
import { t as StrandBoard } from "./strand-board-BW_iXmMk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/math.strand._strandId-Cxtxq-Pq.js
var import_jsx_runtime = require_jsx_runtime();
function MathStrand() {
	const { strandId } = Route$4.useParams();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StrandBoard, {
		subject: "math",
		strandId
	});
}
//#endregion
export { MathStrand as component };
