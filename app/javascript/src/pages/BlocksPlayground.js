import React, { useEffect } from 'react'
import {DefinitionRenderer} from '@chaskiq/components/src/components/packageBlocks/components'
import useScript from '@chaskiq/components/src/components/hooks/useScript'
import logo from '../images/favicon.png'

import './playground/cm.css'
import './playground/dracula.css'

import {
  basic
} from './playground/catalog'
import { Link } from 'react-router-dom'

export default function Playground(){

  const [blocks, setBlocks] = React.useState(basic)
  const [err, setErr] = React.useState(null)

  const status = useScript(
    "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.52.2/codemirror.min.js"
  );

  useEffect(()=>{
    if(status === "ready"){
      initCodeMirror()
    }
  }, [status])

  function initCodeMirror(){
    const editor = window.CodeMirror(document.querySelector('#code-mirror-wrapper'), {
      lineNumbers: true,
      matchBrackets: true,
      autoCloseBrackets: true,
      mode: "application/ld+json",
      lineWrapping: true,
      tabSize: 2,
      value: blocks,
      theme: 'dracula'
    });

    editor.on("change", (e)=>{
      const val = e.getDoc().getValue()
      try {
        JSON.parse(val)
      } catch (error) {
        setErr(error.message)
        console.log("ERORR SKIP", error)
        return 
      }
      
      setErr(null)
      setBlocks(val)
    })
  }

  return (
    <div className="flex">

      <div className="w-1/2 h-screen overflow-auto">

        <div className="">
          <div className="bg-gray-200 p-4 flex space-x-3 items-center">
            <Link to="/">
              {'<-'}
            </Link>
            <img src={logo} width={40} className="border-sm"/>
            <p className="text-lg font-bold">
              CHASKIQ BLOCKS PLAYGROUND
            </p>
          </div>

          <div className="p-4 flex justify-center items-center">
            <div className="py-2 shadow-sm border border-gray-200 rounded-md min-w-3/4">
              <DefinitionRenderer 
                schema={JSON.parse(blocks)} 
                updatePackage={(e)=> console.log("AMAZING NOTHING", e)} 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="text-white w-1/2 h-screen overflow-auto" style={{'background': '#282a36'}}>
        {err && <div className="fixed top-0 z-10 w-full p-2 px-4 bg-red-600 text-white">{err}</div>}
        <div id="code-mirror-wrapper"/>
      </div>

    </div>
  )


}