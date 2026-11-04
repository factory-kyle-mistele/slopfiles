import { RuleTester } from "oxlint/plugins-dev";

import { noInOperatorRule } from "./no-in-operator.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });

tester.run("anti-slop/no-in-operator", noInOperatorRule, {
  valid: [
    "const supported = Object.hasOwn(navigator, 'wakeLock');",
    "for (const key in record) { use(key); }",
  ],
  invalid: [
    {
      name: "key membership check",
      code: "const supported = 'wakeLock' in navigator;",
      errors: [{ messageId: "inOperator" }],
    },
    {
      name: "quoted key",
      code: "const exists = \"id\" in record;",
      errors: [{ messageId: "inOperator" }],
    },
  ],
});
