import { RuleTester } from "oxlint/plugins-dev";

import { noStaticEffectServiceForwardersRule } from "./no-static-effect-service-forwarders.ts";

new RuleTester().run(
	"anti-slop-effect/no-static-effect-service-forwarders",
	noStaticEffectServiceForwardersRule,
	{
		valid: [
			"import { Effect } from 'effect'; Effect.gen(function* () { const service = yield* Preferences; return yield* service.get; });",
			"import { Effect } from 'effect'; class Preferences { static readonly get = Effect.flatMap(Effect.service(this), (_) => { const value = _.get; return Effect.succeed(value); }); }",
			"import { Effect } from 'effect'; const get = Effect.flatMap(Effect.service(this), (_) => _.get);",
			"import { Effect } from 'effect'; class Preferences { static readonly get = (() => { const Effect = customEffect; return Effect.flatMap(Effect.service(this), (_) => _.get); })(); }",
			"class Preferences { static readonly get = Effect.flatMap(Effect.service(this), (_) => _.get); }",
		],
		invalid: [
			{
				code: "import { Effect } from 'effect'; class Preferences { static readonly get = Effect.flatMap(Effect.service(this), (_) => _.get); }",
				errors: [{ messageId: "staticForwarder" }],
			},
			{
				code: "import { Effect as Fx } from 'effect'; class Preferences { static readonly get = (input) => Fx.flatMap(Fx.service(this), (service) => service.get(input)); }",
				errors: [{ messageId: "staticForwarder" }],
			},
			{
				code: "import { Effect } from 'effect'; class Preferences { static readonly get = Effect.service(this).pipe(Effect.flatMap((_) => _.get)); }",
				errors: [{ messageId: "staticForwarder" }],
			},
			{
				code: "import { Effect, pipe as compose } from 'effect'; class Preferences { static readonly get = compose(Effect.service(this), Effect.flatMap((_) => { return _.get; })); }",
				errors: [{ messageId: "staticForwarder" }],
			},
			{
				code: "import { flatMap as chain, service as acquire } from 'effect/Effect'; class Preferences { static readonly get = chain(acquire(this), (_) => _.get()); }",
				errors: [{ messageId: "staticForwarder" }],
			},
			{
				code: "import * as Fx from 'effect/Effect'; class Preferences { static readonly get = Fx.flatMap(Fx.service(this), (_) => _.get); }",
				errors: [{ messageId: "staticForwarder" }],
			},
		],
	},
);
