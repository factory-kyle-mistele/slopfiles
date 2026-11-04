import { RuleTester } from "oxlint/plugins-dev";

import { noServiceOptionRule } from "./no-service-option.ts";

new RuleTester().run("anti-slop-effect/no-service-option", noServiceOptionRule, {
	valid: [
		"Effect.gen(function* () { const service = yield* CustomFetch; });",
		"Effect.gen(function* () { const service = yield* Effect.service(CustomFetch); });",
	],
	invalid: [
		{
			code: "Effect.gen(function* () { const service = yield* Effect.serviceOption(CustomFetch); });",
			errors: [{ messageId: "serviceOption" }],
		},
	],
});
