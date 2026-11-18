import { defineRule } from "@oxlint/plugins";

import type { ESTree } from "@oxlint/plugins";

// Ported from typeonce-dev/ai-automation @ 0bca096, rules/oxlint/src/rules/no-static-effect-service-forwarders.ts,
// via K-Mistele/stegosaurus tools/automation (commit ccb20c8). Upstream is unlicensed.

interface ImportedName {
	imported: string;
	local: string;
}

interface Callback {
	expression: ESTree.Expression;
	parameterName: string | undefined;
}

function importedName(
	specifier: ESTree.ImportSpecifier,
): ImportedName | undefined {
	const imported =
		specifier.imported.type === "Identifier"
			? specifier.imported.name
			: specifier.imported.value;
	if (imported === undefined) return undefined;
	return { imported, local: specifier.local.name };
}

function isStaticClassField(node: ESTree.CallExpression): boolean {
	let current: ESTree.Node | undefined = node.parent;
	while (current !== undefined) {
		if (current.type === "PropertyDefinition") return current.static === true;
		if (current.type === "Program") return false;
		current = current.parent;
	}
	return false;
}

function callbackExpression(node: ESTree.Node): Callback | undefined {
	if (
		node.type !== "ArrowFunctionExpression" &&
		node.type !== "FunctionExpression"
	) {
		return undefined;
	}

	const [parameter] = node.params;
	if (
		node.params.length !== 1 ||
		parameter === undefined ||
		parameter.type !== "Identifier"
	) {
		return undefined;
	}

	const body = node.body;
	if (body === null) return undefined;

	if (body.type !== "BlockStatement") {
		return { expression: body, parameterName: parameter.name };
	}

	const [statement] = body.body;
	if (
		body.body.length !== 1 ||
		statement === undefined ||
		statement.type !== "ReturnStatement" ||
		statement.argument === null
	) {
		return undefined;
	}

	return {
		expression: statement.argument,
		parameterName: parameter.name,
	};
}

function isDirectParameterMember(
	callback: Callback,
): boolean {
	if (callback.parameterName === undefined) return false;

	const expression = callback.expression;
	const member =
		expression.type === "CallExpression" ? expression.callee : expression;

	return (
		member.type === "MemberExpression" &&
		member.object.type === "Identifier" &&
		member.object.name === callback.parameterName
	);
}

/** Disallow exposing Effect service methods through static class forwarders. */
export const noStaticEffectServiceForwardersRule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow static Effect service method forwarders; acquire the service where its method is used.",
		},
		messages: {
			staticForwarder:
				"Do not expose an Effect service method through a static forwarder. Yield the service at the usage site and call the method directly.",
		},
	},
	createOnce(context) {
		const effectNamespaceNames = new Set<string>();
		const flatMapNames = new Set<string>();
		const serviceNames = new Set<string>();
		const pipeNames = new Set<string>();

		const isImportedIdentifier = (
			names: ReadonlySet<string>,
			node: ESTree.IdentifierReference,
		): boolean => {
			if (!names.has(node.name)) return false;

			let scope: ReturnType<typeof context.sourceCode.getScope> | null =
				context.sourceCode.getScope(node);
			while (scope !== null) {
				const variable = scope.set.get(node.name);
				if (variable !== undefined) {
					return variable.defs.some(
						(definition) => definition.type === "ImportBinding",
					);
				}
				scope = scope.upper;
			}
			return false;
		};

		const effectCall = (
			name: "flatMap" | "service",
			names: ReadonlySet<string>,
			node: ESTree.Node,
		): ESTree.CallExpression | undefined => {
			if (node.type !== "CallExpression") return undefined;

			if (node.callee.type === "Identifier") {
				return isImportedIdentifier(names, node.callee) ? node : undefined;
			}

			if (node.callee.type === "MemberExpression") {
				const callee = node.callee;
				if (
					callee.object.type === "Identifier" &&
					isImportedIdentifier(effectNamespaceNames, callee.object) &&
					!callee.computed &&
					callee.property.type === "Identifier" &&
					callee.property.name === name
				) {
					return node;
				}
			}
			return undefined;
		};

		const isServiceThisCall = (node: ESTree.Node): boolean => {
			const call = effectCall("service", serviceNames, node);
			return (
				call !== undefined &&
				call.arguments.length === 1 &&
				call.arguments[0].type === "ThisExpression"
			);
		};

		const isForwardingFlatMap = (node: ESTree.Node): boolean => {
			const call = effectCall("flatMap", flatMapNames, node);
			if (call === undefined) return false;

			const callback = callbackExpression(call.arguments[call.arguments.length - 1]);
			return callback !== undefined && isDirectParameterMember(callback);
		};

		const isPipeCall = (node: ESTree.CallExpression): boolean => {
			if (node.callee.type === "Identifier") {
				return isImportedIdentifier(pipeNames, node.callee);
			}
			return (
				node.callee.type === "MemberExpression" &&
				!node.callee.computed &&
				node.callee.property.type === "Identifier" &&
				node.callee.property.name === "pipe"
			);
		};

		return {
			ImportDeclaration(node) {
				if (node.source.value === "effect") {
					for (const specifier of node.specifiers) {
						if (specifier.type !== "ImportSpecifier") continue;
						const name = importedName(specifier);
						if (name === undefined) continue;

						if (name.imported === "Effect") {
							effectNamespaceNames.add(name.local);
						}
						if (name.imported === "pipe") {
							pipeNames.add(name.local);
						}
					}
					return;
				}

				if (node.source.value !== "effect/Effect") return;

				for (const specifier of node.specifiers) {
					if (specifier.type === "ImportNamespaceSpecifier") {
						effectNamespaceNames.add(specifier.local.name);
						continue;
					}
					if (specifier.type !== "ImportSpecifier") continue;

					const name = importedName(specifier);
					if (name === undefined) continue;

					if (name.imported === "flatMap") flatMapNames.add(name.local);
					if (name.imported === "service") serviceNames.add(name.local);
				}
			},
			CallExpression(node) {
				if (!isStaticClassField(node)) return;

				const flatMap = effectCall("flatMap", flatMapNames, node);
				if (
					flatMap !== undefined &&
					node.arguments.length >= 2 &&
					isServiceThisCall(node.arguments[0]) &&
					isForwardingFlatMap(node)
				) {
					context.report({ node, messageId: "staticForwarder" });
					return;
				}

				if (!isPipeCall(node)) return;

				const pipedEffect =
					node.callee.type === "MemberExpression"
						? node.callee.object
						: node.arguments[0];
				const operators =
					node.callee.type === "MemberExpression"
						? node.arguments
						: node.arguments.slice(1);

				if (
					pipedEffect !== undefined &&
					isServiceThisCall(pipedEffect) &&
					operators.some((operator) => isForwardingFlatMap(operator))
				) {
					context.report({ node, messageId: "staticForwarder" });
				}
			},
		};
	},
});
