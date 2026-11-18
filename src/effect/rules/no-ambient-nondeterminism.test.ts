import { RuleTester } from "oxlint/plugins-dev";

import { noAmbientNondeterminismRule } from "./no-ambient-nondeterminism.ts";

const tester = new RuleTester({
	languageOptions: { parserOptions: { lang: "ts" } },
});

tester.run("anti-slop-effect/no-ambient-nondeterminism", noAmbientNondeterminismRule, {
	valid: [
		"const value = new Date(0);",
		{ code: "const now = Date.now();", filename: "component.tsx" },
		{
			code: "const now = Date.now();",
			options: [{ allowedDateBasenames: ["clock.ts"] }],
			filename: "clock.ts",
		},
		"const crypto = require('node:crypto'); crypto.randomUUID();",
	],
	invalid: [
		{
			name: "ambient crypto",
			code: "const id = crypto.randomUUID();",
			errors: [{ messageId: "ambientCrypto" }],
		},
		{
			name: "globalThis crypto",
			code: "const id = globalThis.crypto.randomUUID();",
			errors: [{ messageId: "ambientCrypto" }],
		},
		{
			name: "ambient Math.random",
			code: "const value = Math.random();",
			errors: [{ messageId: "ambientRandom" }],
		},
		{
			name: "ambient Date.now",
			code: "const now = Date.now();",
			errors: [{ messageId: "ambientDate" }],
		},
		{
			name: "ambient new Date",
			code: "const now = new Date();",
			errors: [{ messageId: "ambientDate" }],
		},
	],
});
