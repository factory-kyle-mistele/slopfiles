import { RuleTester } from "oxlint/plugins-dev";

import { noSilentErrorSwallowRule } from "./no-silent-error-swallow.ts";

new RuleTester().run(
	"anti-slop-effect/no-silent-error-swallow",
	noSilentErrorSwallowRule,
	{
		valid: [
			"program.pipe(Effect.catch((error) => Effect.logError(error)));",
			"program.pipe(Effect.catch(() => Effect.fail(fallback)));",
			"program.pipe(Effect.catchTags({ NotFound: () => Effect.succeed(null) }));",
			"program.pipe(Effect.asVoid);",
		],
		invalid: [
			{
				code: "program.pipe(Effect.catch(() => Effect.void));",
				errors: [{ messageId: "silentSwallow" }],
			},
			{
				code: "program.pipe(Effect.catch(() => { return Effect.unit; }));",
				errors: [{ messageId: "silentSwallow" }],
			},
			{
				code: "program.pipe(Effect.catchTags({ NotFound: () => Effect.void }));",
				errors: [{ messageId: "silentSwallow" }],
			},
		],
	},
);
