import React from 'react'
import Prism from 'prismjs'
import { connect } from 'react-redux'
import FilterMenu from '../../components/FilterMenu'
import { MoreIcon } from '../../components/icons'
import Button from '../../components/Button'
import Input from '../../components/forms/Input'


function VerificationView({app}){
  const [currentLang, setCurrentLang] = React.useState("ruby")
  const [show, setShow] = React.useState(false)

  function setupScript () {
    const hostname = window.location.hostname
    const port = window.location.port ? ':' + window.location.port : ''
    const secure = window.location.protocol === 'https:'
    const httpProtocol = window.location.protocol
    const wsProtocol = secure ? 'wss' : 'ws'
    const hostnamePort = `${hostname}${port}`
  
    const code = `
      <script>
        (function(d,t) {
          var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
          g.src="${httpProtocol}//${hostnamePort}/embed.js"
          s.parentNode.insertBefore(g,s);
          g.onload=function(){
            new window.ChaskiqMessengerEncrypted({
              domain: '${httpProtocol}//${hostnamePort}',
              ws:  '${wsProtocol}://${hostnamePort}/cable',
              app_id: "${app ? app.key : ''}",
              data: {
                email: "user@email.com",
                identifier_key: "INSERT_HMAC_VALUE_HERE",
                properties: { }
              },
              lang: "USER_LANG_OR_DEFAULTS_TO_BROWSER_LANG" 
            })
          }
        })(document,"script");
      </script>
    `
    return Prism.highlight(code, Prism.languages.javascript, 'javascript')
  }

  function keyGeneration () {

    const code = optionsForFilter().find(
      (o)=> o.id === currentLang
    ).code

    return Prism.highlight(code, Prism.languages.ruby, 'ruby')
  }

  function optionsForFilter(){
    return [
      {
        title: 'Ruby',
        description: 'ruby',
        id: 'ruby',
        state: 'archived',
        code: `
        OpenSSL::HMAC.hexdigest(
          'sha256', # hash function
          '${app.encryptionKey}', # secret key (keep safe!)
          current_user.email
        )`
      },
      {
        title: 'NodeJs',
        description: 'nodejs',
        id: 'nodejs',
        code: `
        const crypto = require('crypto');
        const hmac = crypto.createHmac('sha256', '${app.encryptionKey}');
        hmac.update('Message');
        console.log(hmac.digest('hex'));`
      },
      {
        title: 'PHP',
        description: 'PHP',
        id: 'php',
        code: `
        hash_hmac(
          'sha256', // hash function
          $user->email, // user's id
          '${app.encryptionKey}' // secret key (keep safe!)
        );`
      },
      {
        title: 'Python 3',
        description: 'python',
        id: 'python',
        code: `
        import hmac
        import hashlib
        hmac.new(
          b'${app.encryptionKey}', # secret key (keep safe!)
          bytes(request.user.id, encoding='utf-8'), # user's id
          digestmod=hashlib.sha256 # hash function
        ).hexdigest()
        `
      },
      {
        title: 'Golang',
        description: 'golang',
        id: 'golang',
        code: `
        package main

        import (
            "crypto/hmac"
            "crypto/sha256"
            "encoding/hex"
            "fmt"
        )

        func ComputeHmac256(message string, secret string) string {
            key := []byte(secret)
            h := hmac.New(sha256.New, key)
            h.Write([]byte(message))
            return hex.EncodeToString(h.Sum(nil))
        }

        func main() {
            fmt.Println(ComputeHmac256("Message", "secret")) // ${app.encryptionKey}
        }
        
        `
      }
    ]
  }

  function toggleButton(clickHandler) {
    return (
      <div>
        <Button 
          variant={'outlined'} 
          onClick={clickHandler}>
          {currentLang}
        </Button>
      </div>
    )
  }

  function changeLang(item){
    setCurrentLang(item.id)
  }

  return (
    <div className="space-y-6 mx-10-- py-6 text-sm">

      <h2 className="text-lg font-bold-">{I18n.t("identified_users.title")}</h2>
    
      <div className="flex md:w-1/4 items-center">

        <Input 
          label="Identity verification secret" 
          disabled={true}
          value={app.encryptionKey} 
          type={show ? 'text' : 'password'}
          helperText={
            "Don't share this code"
          }
        />

        <Button 
          className="ml-2"
          variant="success"
          style={{
            marginTop: '-12px'
          }}
          onClick={()=>setShow(!show)}>
          show 
        </Button>
        
      </div>

    
      <p className="">
        {I18n.t("identified_users.hint1")}
        To configure identity verification, you will need to generate an HMAC on your server for each logged in user and submit it to Chaskiq.
      </p>

      <p className="font-bold">{I18n.t("identified_users.lang")}</p>


      <div className="flex justify-between items-center">
        <p className="font-bold text-lg">{currentLang}:</p>

        <div className="flex justify-end">
          <FilterMenu
            options={optionsForFilter()}
            value={null}
            filterHandler={changeLang}
            triggerButton={toggleButton}
            position={'right'}
          />      
        </div>
      </div>

      <CodeBox content={keyGeneration()}/>

      <p 
        dangerouslySetInnerHTML={{__html: I18n.t("identified_users.hint2")
      }}/>

      <CodeBox content={setupScript()}/>

    </div>
  )
}

function CodeBox ({content}){
  return (
    <pre className="p-3 bg-black text-white text-sm overflow-auto rounded-sm shadow-sm">
      <div dangerouslySetInnerHTML={{__html: content }}/>    
    </pre>
  )
}


function mapStateToProps (state) {
  const { app } = state
  return {
    app
  }
}

export default connect(mapStateToProps)(VerificationView)

