import { defineRule } from "@oxlint/plugins";

import type { ESTree } from "@oxlint/plugins";

import { isGlobalIdentifier } from "../shared/globals.ts";

// Ported from typeonce-dev/ai-automation @ 0bca096, rules/oxlint/src/rules/no-ambient-nondeterminism.ts,
// via K-Mistele/stegosaurus tools/automation (commit ccb20c8). Upstream is unlicensed.

interface Options {
	allowedDateBasenames?: ReadonlyArray<string>;
	allowedDateExtensions?: ReadonlyArray<string>;
}

function memberPropertyName(node: ESTree.MemberExpression): string | undefined {
	if (!node.computed && node.property.type === "Identifier") {
		return node.property.name;
	}
	if (
		node.computed &&
		node.property.type === "Literal" &&
		typeof node.property.value === "string"
	) {
		return node.property.value;
	}
	return undefined;
}

function propertyNameIs(
	node: ESTree.MemberExpression,
	name: string,
): boolean {
	return memberPropertyName(node) === name;
}

/** Disallow ambient randomness, time, and crypto reads in favor of Effect capabilities. */
export const noAmbientNondeterminismRule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow ambient `Math.random`, `Date` time reads, and global `crypto`; use Effect's Random, Clock, and Crypto capabilities.",
		},
		messages: {
			ambientDate:
				"Do not read the current time from ambient `Date`. Use Effect's Clock or a DateTime capability.",
			ambientRandom:
				"Do not use ambient `Math.random`. Use Effect's Random capability.",
			ambientCrypto:
				"Do not use ambient `crypto`. Use Effect's Crypto capability.",
		},
		schema: [
			{
				type: "object",
				properties: {
					allowedDateBasenames: { type: "array", items: { type: "string" } },
					allowedDateExtensions: { type: "array", items: { type: "string" } },
				},
				additionalProperties: false,
			},
		],
		defaultOptions: [{ allowedDateExtensions: [".tsx"] }],
	},
	create(context) {
		const option = context.options?.[0];
		const options: Options =
			typeof option === "object" && option !== null && !Array.isArray(option)
				? option
				: {};
		const allowedDateBasenames = new Set(options.allowedDateBasenames ?? []);
		const allowedDateExtensions = options.allowedDateExtensions ?? [".tsx"];
		const filename = context.filename.replaceAll("\\", "/");
		const basename = filename.slice(filename.lastIndexOf("/") + 1);
		const allowAmbientDate =
			allowedDateExtensions.some((extension) =>
				filename.endsWith(extension),
			) || allowedDateBasenames.has(basename);

		const isGlobal = (node: ESTree.Node, name: string): boolean =>
			isGlobalIdentifier(context.sourceCode, node, name);

		const isGlobalThisMember = (
			node: ESTree.MemberExpression,
			name: string,
		): boolean =>
			node.object.type === "Identifier" &&
			node.object.name === "globalThis" &&
			memberPropertyName(node) === name;

		const isGlobalObject = (
			node: ESTree.Expression | ESTree.Super,
			name: string,
		): boolean =>
			(node.type === "Identifier" && isGlobal(node, name)) ||
			(node.type === "MemberExpression" && isGlobalThisMember(node, name));

		const isCurrentDateConstructor = (node: ESTree.Expression): boolean =>
			node.type === "Identifier" &&
			node.name === "Date" &&
			isGlobal(node, "Date");

		return {
			Identifier(node) {
				if (node.name !== "crypto") return;
				if (
					node.parent.type === "MemberExpression" &&
					node.parent.property === node &&
					!node.parent.computed
				) {
					return;
				}
				if (isGlobal(node, "crypto")) {
					context.report({ node, messageId: "ambientCrypto" });
				}
			},
			MemberExpression(node) {
				if (isGlobalThisMember(node, "crypto")) {
					context.report({ node, messageId: "ambientCrypto" });
					return;
				}

				if (
					propertyNameIs(node, "random") &&
					isGlobalObject(node.object, "Math")
				) {
					context.report({ node, messageId: "ambientRandom" });
					return;
				}

				if (
					!allowAmbientDate &&
					propertyNameIs(node, "now") &&
					isGlobalObject(node.object, "Date")
				) {
					context.report({ node, messageId: "ambientDate" });
				}
			},
			NewExpression(node) {
				if (
					!allowAmbientDate &&
					isCurrentDateConstructor(node.callee) &&
					node.arguments.length === 0
				) {
					context.report({ node, messageId: "ambientDate" });
				}
			},
			CallExpression(node) {
				if (
					!allowAmbientDate &&
					isCurrentDateConstructor(node.callee) &&
					node.arguments.length === 0
				) {
					context.report({ node, messageId: "ambientDate" });
				}
			},
		};
	},
});
