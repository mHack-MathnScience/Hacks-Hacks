import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as Route } from "./router-B5VgnKaN.mjs";
import { t as StrandBoard } from "./strand-board-BW_iXmMk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/science.strand._strandId-4D_OUtxj.js
var import_jsx_runtime = require_jsx_runtime();
function ScienceStrand() {
	const { strandId } = Route.useParams();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StrandBoard, {
		subject: "science",
		strandId
	});
}
//#endregion
export { ScienceStrand as component };
