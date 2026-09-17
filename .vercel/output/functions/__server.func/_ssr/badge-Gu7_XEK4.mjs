import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { r as cn } from "./app-shell-Dqa0Wea-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/badge-Gu7_XEK4.js
var import_jsx_runtime = require_jsx_runtime();
var badgeVariants = cva("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide uppercase", {
	variants: { variant: {
		default: "border-transparent bg-forest-soft text-forest",
		readiness: "border-transparent bg-forest text-bg",
		supporting: "border-line bg-paper text-ink-soft",
		classroom: "border-line bg-surface text-muted"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
//#endregion
export { Badge as t };
