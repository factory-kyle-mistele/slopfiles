import { defineRule } from "@oxlint/plugins";

import type { ESTree } from "@oxlint/plugins";

// Ported from typeonce-dev/ai-automation @ 0bca096, rules/oxlint/src/rules/no-try-catch.ts,
// via K-Mistele/stegosaurus tools/automation (commit ccb20c8). Upstream is unlicensed.

/** Disallow try/catch in favor of Effect's error tracking. */
export const noTryCatchRule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow try/catch; use `Effect.try`, `Effect.tryPromise`, or explicit error channels.",
		},
		messages: {
			tryCatch:
				"Do not use try/catch. Use `Effect.try`, `Effect.tryPromise`, or an explicit error channel instead.",
		},
	},
	createOnce(context) {
		return {
			TryStatement(node: ESTree.TryStatement) {
				context.report({ node, messageId: "tryCatch" });
			},
		};
	},
});
