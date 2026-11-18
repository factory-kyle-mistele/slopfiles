import { defineRule } from "@oxlint/plugins";

import type { ESTree } from "@oxlint/plugins";

// Ported from typeonce-dev/ai-automation @ 0bca096, rules/oxlint/src/rules/no-global-json.ts,
// via K-Mistele/stegosaurus tools/automation (commit ccb20c8). Upstream is unlicensed.

/** Disallow the global `JSON` API in favor of Effect Schema encode/decode. */
export const noGlobalJsonRule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow the global `JSON` API; encode and decode JSON with Effect Schema.",
		},
		messages: {
			globalJson:
				"Do not use the global `JSON` API. Use Effect Schema's `fromJsonString` and encode/decode APIs instead.",
		},
	},
	createOnce(context) {
		return {
			MemberExpression(node) {
				if (
					node.object.type === "Identifier" &&
					node.object.name === "JSON"
				) {
					context.report({ node, messageId: "globalJson" });
					return;
				}

				if (
					node.object.type === "MemberExpression" &&
					node.object.object.type === "Identifier" &&
					node.object.object.name === "globalThis" &&
					!node.object.computed &&
					node.object.property.type === "Identifier" &&
					node.object.property.name === "JSON"
				) {
					context.report({ node, messageId: "globalJson" });
				}
			},
		};
	},
});
