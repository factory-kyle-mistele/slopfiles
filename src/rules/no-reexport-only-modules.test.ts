import { RuleTester } from "oxlint/plugins-dev";

import { noReExportOnlyModulesRule } from "./no-reexport-only-modules.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });

tester.run("anti-slop/no-reexport-only-modules", noReExportOnlyModulesRule, {
  valid: [
    { code: "export { Component };", filename: "/repo/components/component.ts" },
    {
      code: "export { Component } from './component'; export const name = 'component';",
      filename: "/repo/components/component.ts",
    },
    { code: "", filename: "/repo/components/empty.ts" },
    {
      code: "export * from './components';",
      filename: "/repo/components/index.ts",
      options: [{ allowedFilenames: ["index.ts"] }],
    },
  ],
  invalid: [
    {
      name: "export star",
      code: "export * from './components';",
      filename: "/repo/components/index.ts",
      errors: [{ messageId: "reExportOnly" }],
    },
    {
      name: "named re-exports",
      code: "export { Button } from './button'; export type { ButtonProps } from './button';",
      filename: "/repo/components/public.ts",
      errors: [{ messageId: "reExportOnly" }],
    },
    {
      name: "renamed re-export",
      code: "export { Button as Action } from './button';",
      filename: "/repo/components/renamed.ts",
      errors: [{ messageId: "reExportOnly" }],
    },
    {
      name: "directive is not a statement",
      code: "'use client'; export { default } from './component';",
      filename: "/repo/components/client-component.tsx",
      errors: [{ messageId: "reExportOnly" }],
    },
    {
      name: "namespace re-export",
      code: "export * as Components from './components';",
      filename: "/repo/modules/example/src/main.ts",
      errors: [{ messageId: "reExportOnly" }],
    },
    {
      name: "explicit default re-export",
      code: "export { default } from './button';",
      filename: "/repo/components/button.ts",
      errors: [{ messageId: "reExportOnly" }],
    },
  ],
});
