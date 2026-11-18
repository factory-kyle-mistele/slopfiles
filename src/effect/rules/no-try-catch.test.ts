import { RuleTester } from "oxlint/plugins-dev";

import { noTryCatchRule } from "./no-try-catch.ts";

new RuleTester().run("anti-slop-effect/no-try-catch", noTryCatchRule, {
	valid: [
		"Effect.try({ try: () => parse(value), catch: (cause) => new Error(String(cause)) });",
		"Effect.tryPromise({ try: () => request(), catch: (cause) => new Error(String(cause)) });",
	],
	invalid: [
		{
			code: "try { parse(value); } catch { fallback(); }",
			errors: [{ messageId: "tryCatch" }],
		},
		{
			code: "try { parse(value); } catch (error) { fallback(error); } finally { done(); }",
			errors: [{ messageId: "tryCatch" }],
		},
	],
});
