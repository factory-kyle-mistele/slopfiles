import { defineRule } from "@oxlint/plugins";

import type { ESTree } from "@oxlint/plugins";

// Ported from typeonce-dev/ai-automation @ 0bca096, rules/oxlint/src/rules/prefer-option-from-nullable.ts,
// via K-Mistele/stegosaurus tools/automation (commit ccb20c8). Upstream is unlicensed.

const nullInequalityOperators = new Set(["!==", "!="]);

function isNullLiteral(node: ESTree.Node): boolean {
	return node.type === "Literal" && node.value === null;
}

function isOptionMemberCall(
	node: ESTree.Node | undefined,
	methodName: string,
): boolean {
	if (node?.type !== "CallExpression") return false;

	let callee: ESTree.Expression = node.callee;
	if (callee.type === "TSInstantiationExpression") {
		callee = callee.expression;
	}

	return (
		callee.type === "MemberExpression" &&
		!callee.computed &&
		callee.object.type === "Identifier" &&
		callee.object.name === "Option" &&
		callee.property.type === "Identifier" &&
		callee.property.name === methodName
	);
}

/** Prefer `Option.fromNullable` over ternaries that pick between `Option.some` and `Option.none`. */
export const preferOptionFromNullableRule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Use `Option.fromNullable` instead of ternaries that choose between `Option.some` and `Option.none`.",
		},
		messages: {
			optionFromNullable:
				"Use `Option.fromNullable` instead of a nullable ternary with `Option.some` and `Option.none`.",
		},
	},
	createOnce(context) {
		return {
			ConditionalExpression(node) {
				const test = node.test;
				if (
					test.type !== "BinaryExpression" ||
					!nullInequalityOperators.has(test.operator) ||
					(!isNullLiteral(test.left) && !isNullLiteral(test.right))
				) {
					return;
				}

				if (
					isOptionMemberCall(node.consequent, "some") &&
					isOptionMemberCall(node.alternate, "none")
				) {
					context.report({ node, messageId: "optionFromNullable" });
				}
			},
		};
	},
});
