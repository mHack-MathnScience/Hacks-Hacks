import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/subject-links--i5cpWl4.js
var import_jsx_runtime = require_jsx_runtime();
function SubjectHomeLink({ subject, className, children }) {
	if (subject === "math") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/math",
		className,
		children
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/science",
		className,
		children
	});
}
function StrandLink({ subject, strandId, className, children }) {
	if (subject === "math") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/math/strand/$strandId",
		params: { strandId },
		className,
		children
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/science/strand/$strandId",
		params: { strandId },
		className,
		children
	});
}
function PracticeLink({ subject, teks, className, children }) {
	if (subject === "math") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/math/practice/$teks",
		params: { teks },
		className,
		children
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/science/practice/$teks",
		params: { teks },
		className,
		children
	});
}
//#endregion
export { StrandLink as n, SubjectHomeLink as r, PracticeLink as t };
