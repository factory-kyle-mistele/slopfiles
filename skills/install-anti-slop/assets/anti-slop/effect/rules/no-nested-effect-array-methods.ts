import { defineRule } from "@oxlint/plugins";

import type { ESTree } from "@oxlint/plugins";

// Ported from typeonce-dev/ai-automation @ 0bca096, rules/oxlint/src/rules/no-nested-effect-array-methods.ts,
// via K-Mistele/stegosaurus tools/automation (commit ccb20c8). Upstream is unlicensed.

const ignoredKeys = new Set(["parent"]);

function isEffectArrayCall(node: ESTree.Node): node is ESTree.CallExpression {
	return (
		node.type === "CallExpression" &&
		node.callee.type === "MemberExpression" &&
		!node.callee.computed &&
		node.callee.object.type === "Identifier" &&
		node.callee.object.name === "Array" &&
		node.callee.property.type === "Identifier"
	);
}

function containsEffectArrayCall(node: unknown, seen: WeakSet<object>): boolean {
	if (node === null || typeof node !== "object") return false;
	if (seen.has(node)) return false;
	seen.add(node);

	if (isEffectArrayCall(node as ESTree.Node)) return true;

	for (const [key, value] of Object.entries(node)) {
		if (ignoredKeys.has(key)) continue;

		if (Array.isArray(value)) {
			if (value.some((item) => containsEffectArrayCall(item, seen))) {
				return true;
			}
			continue;
		}

		if (containsEffectArrayCall(value, seen)) return true;
	}

	return false;
}

/** Disallow nested Effect `Array` method calls in favor of `pipe`. */
export const noNestedEffectArrayMethodsRule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow nested Effect `Array` method calls; compose them with `pipe` to preserve inference.",
		},
		messages: {
			nestedEffectArray:
				"Do not nest Effect `Array` method calls. Use `pipe` to preserve inference.",
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
			CallExpression(node) {
				if (!arrayImportedFromEffect || !isEffectArrayCall(node)) return;

				if (
					node.arguments.some((argument) =>
						containsEffectArrayCall(argument, new WeakSet<object>()),
					)
				) {
					context.report({ node, messageId: "nestedEffectArray" });
				}
			},
		};
	},
});
