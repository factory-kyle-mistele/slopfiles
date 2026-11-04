import { RuleTester } from "oxlint/plugins-dev";

import { pipeMaxArgumentsRule } from "./pipe-max-arguments.ts";

new RuleTester().run(
	"anti-slop-effect/pipe-max-arguments",
	pipeMaxArgumentsRule,
	{
		valid: [
			"program.pipe(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19, a20);",
		],
		invalid: [
			{
				code: "program.pipe(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19, a20, a21);",
				errors: [{ messageId: "tooManyPipeArguments" }],
			},
		],
	},
);
