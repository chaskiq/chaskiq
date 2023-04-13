import esbuild from 'esbuild';
import babel from './babel-esbuild.mjs';
import { createServer } from 'http'
import fs from 'fs'
const clients = []

const watch = process.argv.includes('--watch')
const minify = process.argv.includes('--minify')
const metafile = process.argv.includes('--metafile')

console.log("WATCH: ", watch)
console.log("MINIFY: ", minify)
console.log("METAFILE: ", metafile)

const watchOptions = {
    onRebuild(error) {
      clients.forEach((res) => res.write("data: update\n\n"));
      clients.length = 0;
      console.log(error ? error : "load complete");
    },
}


let ctx = await esbuild.context({
        logLevel: 'info',
        target: 'es2020',
        sourcemap: watch,
        define: { 
            'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`,
            'global': 'window',
            'process.env.NODE_DEBUG': '""',
            'define': 'undefined'
        },
        platform: 'browser',
        inject: ['./esbuild/process-shim.js'],
        entryPoints: [
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
          babel({
              filter: /\.([^cpj].*|c([^s].*)?|cs([^s].*)?|css.+|p([^n].*)?|pn([^g].*)?|png.+|j([^s].*)?|js([^o].*)?|jso([^n].*)?|json.+)$/,
            })
        ]
    })

await ctx.watch()

if( watch ){
  let { host, port } = await ctx.serve({
    port: 3001,
    servedir: 'app/assets/builds',
  })
}


