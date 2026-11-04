import { eslintCompatPlugin } from "@oxlint/plugins";

import { noAmbientNondeterminismRule } from "./rules/no-ambient-nondeterminism.ts";
import { noDirectFetchRule } from "./rules/no-direct-fetch.ts";
import { noEffectAsVoidRule } from "./rules/no-effect-asvoid.ts";
import { noGlobalJsonRule } from "./rules/no-global-json.ts";
import { noManualEffectErrorTagRule } from "./rules/no-manual-effect-error-tag.ts";
import { noManualTagComparisonRule } from "./rules/no-manual-tag-comparison.ts";
import { noManualTaggedConstructionRule } from "./rules/no-manual-tagged-construction.ts";
import { noManualTaggedTypeRule } from "./rules/no-manual-tagged-type.ts";
import { noNestedEffectArrayMethodsRule } from "./rules/no-nested-effect-array-methods.ts";
import { noServiceConstructorImportsRule } from "./rules/no-service-constructor-imports.ts";
import { noServiceOptionRule } from "./rules/no-service-option.ts";
import { noShadowedStandardArrayStaticRule } from "./rules/no-shadowed-standard-array-static.ts";
import { noSilentErrorSwallowRule } from "./rules/no-silent-error-swallow.ts";
import { noSqlTypeParameterRule } from "./rules/no-sql-type-parameter.ts";
import { noStaticEffectServiceForwardersRule } from "./rules/no-static-effect-service-forwarders.ts";
import { noTryCatchRule } from "./rules/no-try-catch.ts";
import { pipeMaxArgumentsRule } from "./rules/pipe-max-arguments.ts";
import { preferEffectMatchRule } from "./rules/prefer-effect-match.ts";
import { preferOptionFromNullableRule } from "./rules/prefer-option-from-nullable.ts";
import { preferTaggedErrorHandlingRule } from "./rules/prefer-tagged-error-handling.ts";

/** Opt-in Oxlint rules for Effect service and Layer architecture. */
const antiSlopEffectPlugin = eslintCompatPlugin({
	meta: { name: "anti-slop-effect" },
	rules: {
		"no-ambient-nondeterminism": noAmbientNondeterminismRule,
		"no-direct-fetch": noDirectFetchRule,
		"no-effect-asvoid": noEffectAsVoidRule,
		"no-global-json": noGlobalJsonRule,
		"no-manual-effect-error-tag": noManualEffectErrorTagRule,
		"no-manual-tag-comparison": noManualTagComparisonRule,
		"no-manual-tagged-construction": noManualTaggedConstructionRule,
		"no-manual-tagged-type": noManualTaggedTypeRule,
		"no-nested-effect-array-methods": noNestedEffectArrayMethodsRule,
		"no-service-constructor-imports": noServiceConstructorImportsRule,
		"no-service-option": noServiceOptionRule,
		"no-shadowed-standard-array-static": noShadowedStandardArrayStaticRule,
		"no-silent-error-swallow": noSilentErrorSwallowRule,
		"no-sql-type-parameter": noSqlTypeParameterRule,
		"no-static-effect-service-forwarders": noStaticEffectServiceForwardersRule,
		"no-try-catch": noTryCatchRule,
		"pipe-max-arguments": pipeMaxArgumentsRule,
		"prefer-effect-match": preferEffectMatchRule,
		"prefer-option-from-nullable": preferOptionFromNullableRule,
		"prefer-tagged-error-handling": preferTaggedErrorHandlingRule,
	},
});

export default antiSlopEffectPlugin;
