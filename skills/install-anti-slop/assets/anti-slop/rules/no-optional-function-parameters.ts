import { defineRule } from "@oxlint/plugins";

import type { ESTree } from "@oxlint/plugins";

// Ported from typeonce-dev/ai-automation @ 0bca096, rules/oxlint/src/rules/no-optional-function-parameters.ts,
// via K-Mistele/stegosaurus tools/automation (commit ccb20c8). Upstream is unlicensed.

type FunctionLike = ESTree.Function | ESTree.ArrowFunctionExpression;

/** Parameter list entries, including TypeScript constructor parameter properties. */
type FunctionParameter = ESTree.Function["params"][number];

function isOptionalParameter(param: FunctionParameter): boolean {
  if (param.type === "TSParameterProperty") {
    return param.parameter.optional ?? false;
  }
  return param.optional ?? false;
}

function hasOptionalParameter(node: FunctionLike): boolean {
  return node.params.some(isOptionalParameter);
}

/** Disallow optional function parameters in favor of explicit unions with undefined or null. */
export const noOptionalFunctionParametersRule = defineRule({
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow optional function parameters; use an explicit union with `undefined` or `null`.",
    },
    messages: {
      optionalParameter:
        "Optional parameters hide the presence of an argument. Use an explicit union with `undefined` or `null` instead.",
    },
  },
  createOnce(context) {
    const visit = (node: FunctionLike) => {
      if (hasOptionalParameter(node)) {
        context.report({ node, messageId: "optionalParameter" });
      }
    };

    return {
      FunctionDeclaration: visit,
      FunctionExpression: visit,
      ArrowFunctionExpression: visit,
    };
  },
});
