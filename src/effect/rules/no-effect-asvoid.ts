import { defineRule } from "@oxlint/plugins";

// Ported from typeonce-dev/ai-automation @ 0bca096, rules/oxlint/src/rules/no-effect-asvoid.ts,
// via K-Mistele/stegosaurus tools/automation (commit ccb20c8). Upstream is unlicensed.

/** Disallow `Effect.asVoid`; return an effect whose success type is already void. */
export const noEffectAsVoidRule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow `Effect.asVoid`; return an effect whose success type is already void.",
		},
		messages: {
			effectAsVoid:
				"Avoid `Effect.asVoid`. Return an effect whose success type is already void.",
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
					node.property.name === "asVoid"
				) {
					context.report({ node, messageId: "effectAsVoid" });
				}
			},
		};
	},
});
