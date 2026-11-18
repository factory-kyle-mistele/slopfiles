import { defineRule } from "@oxlint/plugins";

// Ported from typeonce-dev/ai-automation @ 0bca096, rules/oxlint/src/rules/no-service-option.ts,
// via K-Mistele/stegosaurus tools/automation (commit ccb20c8). Upstream is unlicensed.

/** Disallow `Effect.serviceOption`; require services directly. */
export const noServiceOptionRule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow `Effect.serviceOption`; require the service directly and provide it in a layer.",
		},
		messages: {
			serviceOption:
				"Do not use `Effect.serviceOption`. Require the service directly and provide it in a layer.",
		},
	},
	createOnce(context) {
		return {
			MemberExpression(node) {
				if (
					!node.computed &&
					node.object.type === "Identifier" &&
					node.object.name === "Effect" &&
					node.property.type === "Identifier" &&
					node.property.name === "serviceOption"
				) {
					context.report({ node, messageId: "serviceOption" });
				}
			},
		};
	},
});
