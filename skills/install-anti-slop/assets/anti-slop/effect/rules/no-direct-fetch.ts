import { defineRule } from "@oxlint/plugins";

import type { ESTree } from "@oxlint/plugins";

// Ported from typeonce-dev/ai-automation @ 0bca096, rules/oxlint/src/rules/no-direct-fetch.ts,
// via K-Mistele/stegosaurus tools/automation (commit ccb20c8). Upstream is unlicensed.

const fetchHosts = new Set(["globalThis", "window"]);

/** Disallow direct `fetch` calls in favor of a typed HTTP client boundary. */
export const noDirectFetchRule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow direct `fetch` calls; use a typed HTTP client or service boundary.",
		},
		messages: {
			directFetch:
				"Do not call `fetch` directly. Call a typed HTTP client that owns decoding and error handling.",
		},
	},
	createOnce(context) {
		return {
			CallExpression(node) {
				if (node.callee.type === "Identifier" && node.callee.name === "fetch") {
					context.report({ node, messageId: "directFetch" });
					return;
				}

				if (
					node.callee.type === "MemberExpression" &&
					!node.callee.computed &&
					node.callee.property.type === "Identifier" &&
					node.callee.property.name === "fetch" &&
					node.callee.object.type === "Identifier" &&
					fetchHosts.has(node.callee.object.name)
				) {
					context.report({ node, messageId: "directFetch" });
				}
			},
		};
	},
});
