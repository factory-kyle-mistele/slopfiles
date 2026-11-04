import { RuleTester } from "oxlint/plugins-dev";

import { noOptionalFunctionParametersRule } from "./no-optional-function-parameters.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });

tester.run("anti-slop/no-optional-function-parameters", noOptionalFunctionParametersRule, {
  valid: [
    "function save(value: string | undefined) { return value; }",
    "const save = (value: string | null) => value;",
    "type Params = { value?: string };",
    "interface Params { value?: string }",
  ],
  invalid: [
    {
      name: "function declaration",
      code: "function save(value?: string) { return value; }",
      errors: [{ messageId: "optionalParameter" }],
    },
    {
      name: "arrow function",
      code: "const save = (value?: string) => value;",
      errors: [{ messageId: "optionalParameter" }],
    },
    {
      name: "constructor",
      code: "class Service { constructor(private readonly value?: string) {} }",
      errors: [{ messageId: "optionalParameter" }],
    },
  ],
});
