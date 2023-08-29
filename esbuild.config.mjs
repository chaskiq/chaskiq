import esbuild from 'esbuild';
import babel from './babel-esbuild.mjs';
import rails from 'esbuild-rails'
import {sassPlugin} from 'esbuild-sass-plugin'
import postcss from 'postcss'
import postCssConfig from './postcss.config.js'

const watch = process.argv.includes('--watch')
const minify = process.argv.includes('--minify')
const metafile = process.argv.includes('--metafile')

console.log("WATCH: ", watch)
console.log("MINIFY: ", minify)
console.log("METAFILE: ", metafile)

let ctx = await esbuild.context({
  logLevel: 'info',
  target: 'es2020',
  sourcemap: watch ? 'inline' : false,
  define: { 
    'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`,
    'global': 'window',
    'process.env.NODE_DEBUG': '""',
    'define': 'undefined'
  },
  platform: 'browser',
  inject: ['./esbuild/process-shim.js'],
  entryPoints: [
    "app/javascript/new_application.js",
    "app/javascript/application.js", 
    "app/javascript/embed.js",
    "app/javascript/article.js",
    "app/javascript/docs.js",
    "app/javascript/locales.js",
    "app/javascript/twilio_phone_package.js"
  ],
  bundle: true,
  loader: { 
    '.png': 'file',
    '.js': 'jsx',
  },
  metafile,
  minify,
  publicPath: "/assets",
  assetNames: '[name]-[hash].digested',
  //splitting: true,
  //chunkNames: '[name]-[hash].digested',
  //format: 'esm',
  banner: {
    js: `
      ${
        watch ?
          `
            (
              () => {
                const sse = new EventSource("http://localhost:3001/esbuild");
                sse.addEventListener("change", (e) => {
                  console.log("Esbuild message:", e.data);
                  location.reload();
                });
              }
            )();
          `
        : ''
      }
    `
  },
  outdir: 'app/assets/builds',
  plugins: [
    sassPlugin({
      async transform(source, resolveDir) {
        const {css} = await postcss(postCssConfig.plugins).process(source)
        //console.log(css)
        return css
      }
    }),
    rails(),
    babel({
        filter: /\.([^cpj].*|c([^s].*)?|cs([^s].*)?|css.+|p([^n].*)?|pn([^g].*)?|png.+|j([^s].*)?|js([^o].*)?|jso([^n].*)?|json.+)$/,
      })
  ]
})

if( watch ){
  await ctx.watch()
  let { host, port } = await ctx.serve({
    port: 3001,
    servedir: 'app/assets/builds',
  })
} else {
  ctx.rebuild()
  ctx.dispose()
}


