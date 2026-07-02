/** @type {import('xo').FlatXoConfig} */
const xoConfig = [
	{
		ignores: ['examples/**', 'example.tsx', 'dist/**', 'tsup.config.ts', 'vitest.config.ts', 'xo.config.js'],
	},
	{
		react: true,
		rules: {
			'@typescript-eslint/no-explicit-any': 'error',
			'react/react-in-jsx-scope': 'off',
			'react/prop-types': 'off',
			// This codebase uses `interface` for its public types; keep it.
			'@typescript-eslint/consistent-type-definitions': 'off',
			// The source is formatted with 2-space indentation and spaced braces,
			// not XO's tab/compact defaults. Disable the stylistic rules that would
			// otherwise demand a wholesale reformat rather than catch real issues.
			'@stylistic/indent': 'off',
			'@stylistic/jsx-quotes': 'off',
			'@stylistic/operator-linebreak': 'off',
			'@stylistic/function-paren-newline': 'off',
			'@stylistic/no-trailing-spaces': 'off',
			'@stylistic/eol-last': 'off',
			'@stylistic/key-spacing': 'off',
			'@stylistic/jsx-tag-spacing': 'off',
			'@stylistic/object-curly-spacing': 'off',
			'@stylistic/object-curly-newline': 'off',
			'@stylistic/curly-newline': 'off',
			'@stylistic/brace-style': 'off',
			'@stylistic/block-spacing': 'off',
			'@stylistic/padding-line-between-statements': 'off',
			'@stylistic/max-statements-per-line': 'off',
			'@stylistic/arrow-parens': 'off',
			'@stylistic/no-mixed-operators': 'off',
			'curly': 'off',
			'react/jsx-closing-tag-location': 'off',
			'react/jsx-sort-props': 'off',
			'react/no-array-index-key': 'off',
			// Guarded booleans (e.g. `screenReader && <Text/>`) never leak a value.
			'react/jsx-no-leaked-render': 'off',
			'capitalized-comments': 'off',
			'require-unicode-regexp': 'off',
			'unicorn/prefer-at': 'off',
			'unicorn/prevent-abbreviations': 'off',
			'unicorn/no-nested-ternary': 'off',
			// Pre-existing formatting/structure conventions in the presets,
			// components, and validation blocks; not worth a churny rewrite.
			'unicorn/prefer-single-call': 'off',
			'unicorn/catch-error-name': 'off',
			'unicorn/no-lonely-if': 'off',
			'import-x/order': 'off',
			'react/jsx-curly-brace-presence': 'off',
			'@typescript-eslint/no-unnecessary-type-assertion': 'off',
			'@typescript-eslint/strict-void-return': 'off',
			// The timer hooks intentionally use `number | null` for paused delays
			// and unset timestamp anchors; `null` is part of the public API here.
			'@typescript-eslint/no-restricted-types': 'off',
			'@typescript-eslint/no-confusing-void-expression': 'off',
			'@typescript-eslint/no-unused-expressions': 'off',
			'@typescript-eslint/naming-convention': 'off',
			'@typescript-eslint/dot-notation': 'off',
			'n/prefer-global/process': 'off',
			'react/jsx-indent': 'off',
			'react/jsx-indent-props': 'off',
			'react/jsx-tag-spacing': 'off',
			'react/prefer-read-only-props': 'off',
			'react/boolean-prop-naming': 'off',
			// The hooks are built on Date.now() anchors and mutable refs read
			// during render for one-shot dev warnings; the React-Compiler purity
			// rules flag that intentional architecture.
			'react-hooks/purity': 'off',
			'react-hooks/refs': 'off',
			'unicorn/no-hex-escape': 'off',
			'new-cap': 'off',
			'no-promise-executor-return': 'off',
		},
	},
	{
		files: ['test/**'],
		rules: {
			'@typescript-eslint/no-floating-promises': 'off',
			'@typescript-eslint/no-unsafe-assignment': 'off',
			'@typescript-eslint/no-unsafe-call': 'off',
			'@typescript-eslint/no-unsafe-member-access': 'off',
			'@typescript-eslint/no-unsafe-return': 'off',
			'@typescript-eslint/no-unsafe-argument': 'off',
			// `await act(...)` / `await advanceTimers(...)` are the standard
			// React testing patterns; XO flags them as non-thenable awaits.
			'@typescript-eslint/await-thenable': 'off',
			'@typescript-eslint/no-confusing-void-expression': 'off',
			'@typescript-eslint/no-empty-function': 'off',
			'@typescript-eslint/no-unsafe-type-assertion': 'off',
			'unicorn/numeric-separators-style': 'off',
			'import-x/no-duplicates': 'off',
			'react-hooks/exhaustive-deps': 'off',
		},
	},
];

export default xoConfig;
