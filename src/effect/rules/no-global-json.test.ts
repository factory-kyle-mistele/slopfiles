import { RuleTester } from "oxlint/plugins-dev";

import { noGlobalJsonRule } from "./no-global-json.ts";

new RuleTester().run("anti-slop-effect/no-global-json", noGlobalJsonRule, {
	valid: [
		"Schema.encodeEffect(Schema.fromJsonString(Schema.Json))(value);",
		"const codec = { JSON: { stringify: (value) => value } }; codec.JSON.stringify(value);",
	],
	invalid: [
		{
			code: "JSON.stringify(value);",
			errors: [{ messageId: "globalJson" }],
		},
		{
			code: "globalThis.JSON.parse(value);",
			errors: [{ messageId: "globalJson" }],
		},
	],
});
