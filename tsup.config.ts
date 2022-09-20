import { defineConfig } from 'tsup';

defineConfig({
	clean: true,
	dts: false,
	entry: ['src/index.ts'],
	format: ['esm', 'cjs'],
	minify: false,
	skipNodeModulesBundle: true,
	sourcemap: true,
	target: 'es2021',
	esbuildOptions: (options, context) => {
		if (context.format === 'cjs') {
			options.banner = {
				js: '"use strict";',
			};
		}
	},
	tsconfig: 'src/tsconfig.json',
	bundle: false,
	shims: false,
	keepNames: true,
	splitting: false,
});
