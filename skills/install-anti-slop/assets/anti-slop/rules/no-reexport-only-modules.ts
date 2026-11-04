import { defineRule } from "@oxlint/plugins";

import type { ESTree } from "@oxlint/plugins";

// Ported from typeonce-dev/ai-automation @ 0bca096, rules/oxlint/src/rules/no-reexport-only-modules.ts,
// via K-Mistele/stegosaurus tools/automation (commit ccb20c8). Upstream is unlicensed.

interface Options {
  allowedFilenames?: ReadonlyArray<string>;
}

function isReExport(statement: ESTree.Statement): boolean {
  return (
    statement.type === "ExportAllDeclaration" ||
    (statement.type === "ExportNamedDeclaration" &&
      statement.source !== null)
  );
}

/** Disallow modules whose only statements are re-exports. */
export const noReExportOnlyModulesRule = defineRule({
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow modules whose only responsibility is re-exporting other modules.",
    },
    messages: {
      reExportOnly:
        "Do not create re-export-only modules. Import from the owning module directly, or mark this intentional public entry point with a scoped lint override.",
    },
    schema: [
      {
        type: "object",
        properties: {
          allowedFilenames: { type: "array", items: { type: "string" } },
        },
        additionalProperties: false,
      },
    ],
    defaultOptions: [{ allowedFilenames: [] }],
  },
  create(context) {
    const option = context.options?.[0];
    const options: Options =
      typeof option === "object" && option !== null && !Array.isArray(option)
        ? option
        : {};
    const allowedFilenames = new Set(options.allowedFilenames ?? []);
    const filename = context.filename.replaceAll("\\", "/");
    const basename = filename.slice(filename.lastIndexOf("/") + 1);

    if (allowedFilenames.size === 0 || !allowedFilenames.has(basename)) {
      return {
        Program(node) {
          const statements = node.body.filter(
            (statement) =>
              statement.type !== "ExpressionStatement" ||
              typeof statement.directive !== "string",
          );

          if (
            statements.length > 0 &&
            statements.every((statement) => isReExport(statement))
          ) {
            context.report({ node, messageId: "reExportOnly" });
          }
        },
      };
    }

    return {};
  },
});
