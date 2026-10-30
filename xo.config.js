import base from '@costajohnt/ink-config/xo';

/** @type {import('xo').FlatXoConfig} */
const xoConfig = [
	...base,
	{
		// Rules this codebase does not satisfy yet under the shared config.
		// Burn these down by fixing the code and deleting the line.
		rules: {
			'@eslint-react/naming-convention-ref-name': 'off',
			'@stylistic/arrow-parens': 'off',
			'@stylistic/block-spacing': 'off',
			'@stylistic/brace-style': 'off',
			'@stylistic/jsx-curly-brace-presence': 'off',
			'@stylistic/max-statements-per-line': 'off',
			'@stylistic/no-mixed-operators': 'off',
			'@stylistic/object-curly-newline': 'off',
			'@stylistic/object-curly-spacing': 'off',
			'@stylistic/padding-line-between-statements': 'off',
			'@typescript-eslint/consistent-type-definitions': 'off',
			'@typescript-eslint/no-restricted-types': 'off',
			'@typescript-eslint/no-unused-expressions': 'off',
			curly: 'off',
			'import-x/order': 'off',
			'jsdoc/check-indentation': 'off',
			'jsdoc/escape-inline-tags': 'off',
			'jsdoc/require-asterisk-prefix': 'off',
			'jsx-a11y-x/aria-props': 'off',
			'n/prefer-global/process': 'off',
			'react-hooks/purity': 'off',
			'react-hooks/refs': 'off',
			'unicorn/catch-error-name': 'off',
			'unicorn/consistent-boolean-name': 'off',
			'unicorn/name-replacements': 'off',
			'unicorn/no-immediate-mutation': 'off',
			'unicorn/no-lonely-if': 'off',
			'unicorn/no-nested-ternary': 'off',
			'unicorn/prefer-combined-guards': 'off',
			'unicorn/prefer-export-from': 'off',
			'unicorn/prefer-includes-over-repeated-comparisons': 'off',
			'unicorn/prefer-simple-condition-first': 'off',
			'unicorn/prefer-single-call': 'off',
			'unicorn/prefer-ternary': 'off',
			'unicorn/single-line-block-comment-style': 'off',
		},
	},
	{
		files: ['test/**', 'src/**/__tests__/**'],
		rules: {
			'@typescript-eslint/await-thenable': 'off',
			'@typescript-eslint/naming-convention': 'off',
			'@typescript-eslint/no-confusing-void-expression': 'off',
			'@typescript-eslint/no-empty-function': 'off',
			'import-x/no-duplicates': 'off',
			'node-test/no-import-test-files': 'off',
			'react-hooks/exhaustive-deps': 'off',
			'unicorn/no-global-object-property-assignment': 'off',
			'unicorn/numeric-separators-style': 'off',
			'unicorn/prefer-else-if': 'off',
			'unicorn/prefer-global-number-constants': 'off',
		},
	},
	{
		files: ['**/*.md'],
		rules: {
			'markdown/fenced-code-language': 'off',
		},
	},
	{
		files: ['package.json'],
		rules: {
			'package-json/prefer-shorthand': 'off',
			'package-json/sort-properties': 'off',
			'package-json/valid-fields': 'off',
		},
	},
];

export default xoConfig;
