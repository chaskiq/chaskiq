import ChaskiqMessenger from './messenger'
import {setCookie, getCookie, deleteCookie} from './cookies'

import {AUTH} from './graphql/queries'
import GraphqlClient from './graphql/client'

export default class ChaskiqMessengerEncrypted {

  constructor(props) {
    this.props = props
    const data = {
      referrer: window.location.path,
      email: this.props.email,
      properties: this.props.properties
    }

    this.getSession = ()=>{
      return getCookie("chaskiq_session_id") || "" 
    }

    this.checkCookie = (val)=>{
      setCookie("chaskiq_session_id", val, 1)
    }

    this.defaultHeaders = {
      app: this.props.app_id,
      enc_data: this.props.data,
      user_data: JSON.stringify(data),
      session_id: this.getSession(),
      lang: this.props.lang || navigator.language || navigator.userLanguage
    }

    this.graphqlClient = new GraphqlClient({
      config: this.defaultHeaders,
      baseURL: `${this.props.domain}/api/graphql`
    })

    this.graphqlClient.send(AUTH, {}, {
      success: (data)=>{

        const user = data.messenger.user

        if (user.session_id){
          this.checkCookie(user.session_id)        
        }else{
          deleteCookie("chaskiq_session_id")  
        }

        const messenger = new ChaskiqMessenger(
          Object.assign({}, user, {
            app_id: this.props.app_id, 
            encData: this.props.data,
            encryptedMode: true,
            domain: this.props.domain,
            ws: this.props.ws,
            locale: this.props.lang,
          })
        )

        messenger.render()


      },
      errors: ()=>{
        debugger
      }
    })

    this.sendCommand = (action, data={})=>{
      let event = new CustomEvent("chaskiq_events", 
                                  {
                                    bubbles: true, 
                                    detail: {action: action, data: data}
                                  }); 
      window.document.body.dispatchEvent(event);
    }

  }
} 