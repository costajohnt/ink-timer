import base from '@costajohnt/ink-config/xo';

/**
@type {import('xo').FlatXoConfig}
*/
const xoConfig = [
	...base,
	{
		rules: {
			// `null` is public API: a `null` delay means "paused" and the
			// timestamp anchors are nullable; switching to `undefined` is breaking.
			'@typescript-eslint/no-restricted-types': 'off',
			// The hooks are documented as usable with any React renderer;
			// importing `node:process` would break non-Node bundles.
			'n/prefer-global/process': 'off',
			// Start anchors are captured with Date.now() at mount so a timer that
			// auto-starts counts from first render; deferring to an effect shifts timing.
			'react-hooks/purity': 'off',
			// Warn-once flags and the format warn context are refs read during
			// render so dev warnings fire once per instance, synchronously.
			'react-hooks/refs': 'off',
		},
	},
	{
		files: ['test/**/*.ts'],
		rules: {
			// Harness components in `.ts` tests use createElement and keep React's
			// PascalCase component naming.
			'@typescript-eslint/naming-convention': 'off',
		},
	},
	{
		files: ['test/setup.ts'],
		rules: {
			// React reads `IS_REACT_ACT_ENVIRONMENT` from the global object.
			'unicorn/no-global-object-property-assignment': 'off',
		},
	},
];

export default xoConfig;
