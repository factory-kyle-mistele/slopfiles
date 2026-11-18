import { defineRule } from "@oxlint/plugins";

// Ported from typeonce-dev/ai-automation @ 0bca096, rules/oxlint/src/rules/no-sql-type-parameter.ts,
// via K-Mistele/stegosaurus tools/automation (commit ccb20c8). Upstream is unlicensed.

/** Disallow `sql<Type>` tagged templates whose row types are asserted rather than validated. */
export const noSqlTypeParameterRule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow `sql<Type>` tagged templates; use typed query builders or validated schemas.",
		},
		messages: {
			sqlTypeParameter:
				"Do not use `sql<Type>` templates. Use a typed query builder or decode rows with a validated schema instead.",
		},
	},
	createOnce(context) {
		return {
			TaggedTemplateExpression(node) {
				const isSqlTag =
					node.tag.type === "Identifier" && node.tag.name === "sql";
				if (!isSqlTag || node.typeArguments === null) return;

				context.report({ node, messageId: "sqlTypeParameter" });
			},
		};
	},
});
