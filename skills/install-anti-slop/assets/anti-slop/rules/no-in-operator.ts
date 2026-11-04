import { defineRule } from "@oxlint/plugins";

import type { ESTree } from "@oxlint/plugins";

// Ported from typeonce-dev/ai-automation @ 0bca096, rules/oxlint/src/rules/no-in-operator.ts,
// via K-Mistele/stegosaurus tools/automation (commit ccb20c8). Upstream is unlicensed.

/** Disallow `in` operator key checks in favor of explicit shape evidence. */
export const noInOperatorRule = defineRule({
  meta: {
    type: "problem",
    docs: {
      description:
        'Disallow `in` operator key checks; decode the value into a named type or use `Object.hasOwn`.',
    },
    messages: {
      inOperator:
        'Do not use the `in` operator to check for object keys. Decode input into a named type, or use `Object.hasOwn` for an explicit own-key check.',
    },
  },
  createOnce(context) {
    return {
      BinaryExpression(node: ESTree.BinaryExpression) {
        if (node.operator === "in") {
          context.report({ node, messageId: "inOperator" });
        }
      },
    };
  },
});
