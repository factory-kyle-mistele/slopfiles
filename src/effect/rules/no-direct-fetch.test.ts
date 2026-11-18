import { RuleTester } from "oxlint/plugins-dev";

import { noDirectFetchRule } from "./no-direct-fetch.ts";

new RuleTester().run("anti-slop-effect/no-direct-fetch", noDirectFetchRule, {
	valid: [
		"api.fetch({ id });",
		"sitemapService.fetch({ index });",
		"import { fetch as expoFetch } from 'expo/fetch'; expoFetch(url);",
	],
	invalid: [
		{
			code: "fetch('/api');",
			errors: [{ messageId: "directFetch" }],
		},
		{
			code: "window.fetch('/api');",
			errors: [{ messageId: "directFetch" }],
		},
		{
			code: "globalThis.fetch('/api');",
			errors: [{ messageId: "directFetch" }],
		},
	],
});
