import { defineRule } from "@oxlint/plugins";

import type { ESTree } from "@oxlint/plugins";

// Ported from typeonce-dev/ai-automation @ 0bca096, rules/oxlint/src/rules/pipe-max-arguments.ts,
// via K-Mistele/stegosaurus tools/automation (commit ccb20c8). Upstream is unlicensed.

const maxPipeArguments = 20;

/** Limit `pipe` argument counts; split longer pipelines into named steps. */
export const pipeMaxArgumentsRule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Limit `pipe` calls to 20 arguments; split longer pipelines into named steps.",
		},
		messages: {
			tooManyPipeArguments:
				"This `pipe` call has {{count}} arguments; the maximum is {{max}}. Split it into smaller named steps.",
		},
	},
	createOnce(context) {
		return {
			CallExpression(node: ESTree.CallExpression) {
				if (
					node.callee.type === "MemberExpression" &&
					!node.callee.computed &&
					node.callee.property.type === "Identifier" &&
					node.callee.property.name === "pipe" &&
					node.arguments.length > maxPipeArguments
				) {
					context.report({
						node,
						messageId: "tooManyPipeArguments",
						data: { count: node.arguments.length, max: maxPipeArguments },
					});
				}
			},
		};
	},
});
