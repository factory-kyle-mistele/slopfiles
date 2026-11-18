import { RuleTester } from "oxlint/plugins-dev";

import { noSqlTypeParameterRule } from "./no-sql-type-parameter.ts";

const tester = new RuleTester({
	languageOptions: { parserOptions: { lang: "ts" } },
});

tester.run("anti-slop-effect/no-sql-type-parameter", noSqlTypeParameterRule, {
	valid: [
		"const query = sql`select * from users`;",
		"const query = db.sql`select * from users`;",
		"const query = db.sql<{ id: string }>`select * from users`;",
	],
	invalid: [
		{
			code: "const query = sql<{ id: string }>`select * from users`;",
			errors: [{ messageId: "sqlTypeParameter" }],
		},
	],
});
