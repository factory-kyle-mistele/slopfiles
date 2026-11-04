import { RuleTester } from "oxlint/plugins-dev";

import { preferOptionFromNullableRule } from "./prefer-option-from-nullable.ts";

const tester = new RuleTester({
	languageOptions: { parserOptions: { lang: "ts" } },
});

tester.run(
	"anti-slop-effect/prefer-option-from-nullable",
	preferOptionFromNullableRule,
	{
		valid: [
			"const value = Option.fromNullable(input);",
			"const value = input === null ? Option.none() : Option.some(input);",
			"const value = input !== undefined ? Option.some(input) : Option.none();",
		],
		invalid: [
			{
				code: "const value = input !== null ? Option.some(input) : Option.none();",
				errors: [{ messageId: "optionFromNullable" }],
			},
			{
				code: "const value = null != input ? Option.some(input) : Option.none();",
				errors: [{ messageId: "optionFromNullable" }],
			},
			{
				code: "const value = input !== null ? Option.some<string>(input) : Option.none();",
				errors: [{ messageId: "optionFromNullable" }],
			},
		],
	},
);
