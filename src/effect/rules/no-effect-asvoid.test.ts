import { RuleTester } from "oxlint/plugins-dev";

import { noEffectAsVoidRule } from "./no-effect-asvoid.ts";

new RuleTester().run("anti-slop-effect/no-effect-asvoid", noEffectAsVoidRule, {
	valid: ["program.pipe(Effect.as(undefined));", "Effect.as(undefined)(program);"],
	invalid: [
		{
			code: "program.pipe(Effect.asVoid);",
			errors: [{ messageId: "effectAsVoid" }],
		},
		{
			code: "Effect.asVoid(program);",
			errors: [{ messageId: "effectAsVoid" }],
		},
	],
});
