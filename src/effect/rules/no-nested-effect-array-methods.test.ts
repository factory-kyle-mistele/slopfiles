import { RuleTester } from "oxlint/plugins-dev";

import { noNestedEffectArrayMethodsRule } from "./no-nested-effect-array-methods.ts";

new RuleTester().run(
	"anti-slop-effect/no-nested-effect-array-methods",
	noNestedEffectArrayMethodsRule,
	{
		valid: [
			"import { Array } from 'effect'; Array.filter(values, predicate);",
			"import { Array as EffectArray } from 'effect'; EffectArray.filter(values, (value) => Array.contains(ids, value.id));",
			"import { Array } from 'effect'; const contains = Array.contains(ids); Array.filter(values, (value) => contains(value.id));",
			"Array.filter(values, (value) => Array.contains(ids, value.id));",
		],
		invalid: [
			{
				code: "import { Array } from 'effect'; Array.filter(values, (value) => Array.contains(ids, value.id));",
				errors: [{ messageId: "nestedEffectArray" }],
			},
			{
				code: "import { Array } from 'effect'; Array.map(Array.filter(values, predicate), mapper);",
				errors: [{ messageId: "nestedEffectArray" }],
			},
		],
	},
);
