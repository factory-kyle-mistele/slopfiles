import { defineRule } from "@oxlint/plugins";

import type { ESTree } from "@oxlint/plugins";

// Ported from typeonce-dev/ai-automation @ 0bca096, rules/oxlint/src/rules/no-silent-error-swallow.ts,
// via K-Mistele/stegosaurus tools/automation (commit ccb20c8). Upstream is unlicensed.

const catchMethods = new Set([
	"catch",
	"catchTag",
	"catchTags",
	"catchReason",
	"catchReasons",
]);

const voidOrUnitMethods = new Set(["void", "unit"]);

function isEffectMember(
	node: ESTree.Node,
	methods: ReadonlySet<string>,
): boolean {
	return (
		node.type === "MemberExpression" &&
		!node.computed &&
		node.object.type === "Identifier" &&
		node.object.name === "Effect" &&
		node.property.type === "Identifier" &&
		methods.has(node.property.name)
	);
}

function returnsOnlyVoid(node: ESTree.Node): boolean {
	if (
		node.type !== "ArrowFunctionExpression" &&
		node.type !== "FunctionExpression"
	) {
		return false;
	}

	if (node.body === null) return false;
	if (isEffectMember(node.body, voidOrUnitMethods)) return true;

	if (node.body.type !== "BlockStatement") return false;
	if (node.body.body.length !== 1) return false;

	const statement = node.body.body[0];
	return (
		statement.type === "ReturnStatement" &&
		statement.argument !== null &&
		isEffectMember(statement.argument, voidOrUnitMethods)
	);
}

/** Disallow silently swallowing Effect errors with Effect.void or Effect.unit. */
export const noSilentErrorSwallowRule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow swallowing Effect errors with `Effect.void` or `Effect.unit` in catch handlers; recover, transform, or propagate them.",
		},
		messages: {
			silentSwallow:
				"Do not silently swallow an Effect error with `Effect.void` or `Effect.unit`. Recover meaningfully, transform the error, or let it propagate.",
		},
	},
	createOnce(context) {
		return {
			CallExpression(node) {
				if (!isEffectMember(node.callee, catchMethods)) return;

				for (const argument of node.arguments) {
					if (returnsOnlyVoid(argument)) {
						context.report({ node, messageId: "silentSwallow" });
						continue;
					}

					if (argument.type !== "ObjectExpression") continue;

					for (const property of argument.properties) {
						if (property.type === "Property" && returnsOnlyVoid(property.value)) {
							context.report({ node, messageId: "silentSwallow" });
						}
					}
				}
			},
		};
	},
});
