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

esbuild
    .build({
        logLevel: 'info',
        sourcemap: watch,
        define: { 
            'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`,
            'global': 'window',
            'process.env.NODE_DEBUG': '""',
        },
        platform: 'browser',
        inject: ['./esbuild/process-shim.js'],
        entryPoints: [
            "app/javascript/application.js", 
            "app/javascript/embed.js",
            "app/javascript/article.js",
            "app/javascript/docs.js",
            "app/javascript/locales.js",
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
                  `(() => new EventSource("http://localhost:3001").onmessage = () => location.reload())();`
                : ''
              }
            `,
        },
        watch: watch && watchOptions,
        outdir: 'app/assets/builds',
        plugins: [
          babel({
              filter: /\.([^cpj].*|c([^s].*)?|cs([^s].*)?|css.+|p([^n].*)?|pn([^g].*)?|png.+|j([^s].*)?|js([^o].*)?|jso([^n].*)?|json.+)$/,
            })
        ]
    })
    .then(result => {
        console.log(result)
        if (watch) {
          console.log('Build finished, watching for changes...')
        } else {
          console.log('Build finished, Congrats')
        }

        if(metafile){
           fs.writeFileSync('esbuild-meta.json', JSON.stringify(result.metafile))
        }
      }).catch(result => {
        console.log(result)
        process.exit(1)
      })

if( watch){
    createServer((req, res) => {
        return clients.push(
            res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Access-Control-Allow-Origin": "*",
            Connection: "keep-alive",
            }),
        );
        }).listen(3001);
}