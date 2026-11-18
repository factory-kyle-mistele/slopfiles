import { resolveVariable } from "../../shared/scope.ts";

import type { ESTree, SourceCode } from "@oxlint/plugins";

/** Report whether an identifier references the builtin global binding `name`. */
export function isGlobalIdentifier(
	sourceCode: SourceCode,
	node: ESTree.Node,
	name: string,
): boolean {
	if (node.type !== "Identifier" || node.name !== name) return false;
	if (sourceCode.isGlobalReference(node)) return true;
	const variable = resolveVariable(
		sourceCode,
		node as unknown as ESTree.IdentifierReference,
	);
	return variable === null || variable.defs.length === 0;
}
