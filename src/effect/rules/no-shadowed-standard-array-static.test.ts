import { RuleTester } from "oxlint/plugins-dev";

import { noShadowedStandardArrayStaticRule } from "./no-shadowed-standard-array-static.ts";

new RuleTester().run(
	"anti-slop-effect/no-shadowed-standard-array-static",
	noShadowedStandardArrayStaticRule,
	{
		valid: [
			"Array.from(values);",
			"import { Array as EffectArray } from 'effect'; Array.from(values); EffectArray.map(values, (value) => value);",
			"import { Array } from 'effect'; globalThis.Array.from(values);",
			"import { Array } from 'effect'; Array.map(values, (value) => value);",
		],
		invalid: [
			{
				code: "import { Array } from 'effect'; Array.from(values);",
				errors: [{ messageId: "shadowedArrayStatic" }],
			},
			{
				code: "import { Array } from 'effect'; Array.isArray(values);",
				errors: [{ messageId: "shadowedArrayStatic" }],
			},
			{
				code: "import { Array } from 'effect'; Array.of(value);",
				errors: [{ messageId: "shadowedArrayStatic" }],
			},
		],
	},
);
