import path from 'path'
import minimist from 'minimist'
import { getPackages } from '@lerna/project'
import filterPackages from '@lerna/filter-packages'
import batchPackages from '@lerna/batch-packages'
import sourcemaps from 'rollup-plugin-sourcemaps'
import typescript from 'rollup-plugin-typescript2'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import babel from '@rollup/plugin-babel'
import sizes from '@atomico/rollup-plugin-sizes'
import autoExternal from 'rollup-plugin-auto-external'
import multiInput from 'rollup-plugin-multi-input';
import css from "rollup-plugin-import-css";
import json from "@rollup/plugin-json";
import image from '@rollup/plugin-image';

async function getSortedPackages(scope, ignore) {
  const packages = await getPackages(__dirname)
  const filtered = filterPackages(packages, scope, ignore, false)

  return batchPackages(filtered)
    .filter(item => item.name !== '@chaskiq/do')
    .reduce((arr, batch) => arr.concat(batch), [])
}

async function build(commandLineArgs) {
  const config = []

  // Support --scope and --ignore globs if passed in via commandline
  const { scope, ignore } = minimist(process.argv.slice(2))
  const packages = await getSortedPackages(scope, ignore)

  // prevent rollup warning
  delete commandLineArgs.ci
  delete commandLineArgs.scope
  delete commandLineArgs.ignore

  packages.forEach(pkg => {
    const basePath = path.relative(__dirname, pkg.location)
    const input = path.join(basePath, 'src/index.js')
    const {
      name,
      main,
      umd,
      module,
    } = pkg.toJSON()

    const basePlugins = [
			image(),
      sourcemaps(),
      resolve(),
			css(),
			json(),
			babel({ 
				babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        presets: ['@babel/env', '@babel/preset-react']
    	}),
      commonjs(),
      /*babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
      }),*/

      sizes(),
    ]

    config.push({
      // perf: true,
      input,
      output: [
        {
          name,
          file: path.join(basePath, umd),
          format: 'umd',
          sourcemap: true,
        },
        {
          name,
          file: path.join(basePath, main),
          format: 'cjs',
          sourcemap: true,
          exports: 'auto',
        },
        {
          name,
          file: path.join(basePath, module),
          format: 'es',
          sourcemap: true,
        },
      ],
      plugins: [
        autoExternal({
          packagePath: [path.join(basePath, 'package.json'), './package.json'],
        }),
        ...basePlugins,
      ],
    })

    // an additional multi output
    config.push(
      {
        input: [path.join(basePath, "/src/**/*.js")],
        output: {
          format: 'esm',
          dir: path.join(basePath, "/dist/esm"),
        },
        plugins: [ multiInput(), ...basePlugins]
      },
    )

  })

  return config
}

export default build