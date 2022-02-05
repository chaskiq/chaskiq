import babel from '@babel/core';
import fs from 'fs';
import path from 'path';

const pluginBabel = (options = {}) => ({
	name: 'babel',
	setup(build, { transform } = {}) {
		const { filter = /.*/, namespace = '', config = {} } = options;

		const transformContents = ({ args, contents }) => {
			const babelOptions = babel.loadOptions({
				...config,
				filename: args.path,
				caller: {
					name: 'esbuild-plugin-babel',
					supportsStaticESM: true
				}
			});
			if (!babelOptions) return { contents };

			if (babelOptions.sourceMaps) {
				const filename = path.relative(process.cwd(), args.path);

				babelOptions.sourceFileName = filename;
			}

			return new Promise((resolve, reject) => {
				babel.transform(contents, babelOptions, (error, result) => {
					if(error) {
						console.log(error)
						 reject(error) 
					 } else { 
						 resolve({ contents: result.code });
					 }
				});
			});
		};

		if (transform) return transformContents(transform);

		build.onLoad({ filter, namespace }, async args => {

			if (args.path.includes('node_modules') && !args.path.includes('reactour') ) return null;

			if(args.path.includes(".json") || args.path.includes(".png") || args.path.includes(".css")  ) return null;

			const contents = await fs.promises.readFile(args.path, 'utf8');

			return transformContents({ args, contents });
		});
	}
});

export default pluginBabel;