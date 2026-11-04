import { defineRule } from "@oxlint/plugins";

import type { ESTree } from "@oxlint/plugins";

// Ported from typeonce-dev/ai-automation @ 0bca096, rules/oxlint/src/rules/no-static-effect-service-forwarders.ts,
// via K-Mistele/stegosaurus tools/automation (commit ccb20c8). Upstream is unlicensed.

const standardArrayMethods = new Set(["from", "isArray", "of"]);

/** When `Array` is imported from `effect`, require `globalThis.Array` for standard Array statics. */
export const noShadowedStandardArrayStaticRule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"When `Array` is imported from `effect`, require `globalThis.Array` for standard Array static methods.",
		},
		messages: {
			shadowedArrayStatic:
				"`Array` is imported from `effect` in this file. Use `globalThis.Array` for standard `Array` static methods.",
		},
	},
	createOnce(context) {
		let arrayImportedFromEffect = false;

		return {
			ImportDeclaration(node) {
				if (node.source.value !== "effect") return;

				for (const specifier of node.specifiers) {
					if (
						specifier.type === "ImportSpecifier" &&
						specifier.imported.type === "Identifier" &&
						specifier.imported.name === "Array" &&
						specifier.local.name === "Array"
					) {
						arrayImportedFromEffect = true;
					}
				}
			},
			MemberExpression(node) {
				if (
					arrayImportedFromEffect &&
					node.object.type === "Identifier" &&
					node.object.name === "Array" &&
					!node.computed &&
					node.property.type === "Identifier" &&
					standardArrayMethods.has(node.property.name)
				) {
					context.report({ node, messageId: "shadowedArrayStatic" });
				}
			},
		};
	},
});
