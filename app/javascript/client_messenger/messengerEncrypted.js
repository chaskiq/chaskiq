import Hermessenger from './messenger'
import {setCookie, getCookie, deleteCookie} from './cookies'

import {AUTH} from './graphql/queries'
import GraphqlClient from './graphql/client'

export default class HermessengerEncrypted {

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
      lang: this.props.lang
    }

    this.grapqhClient = new GraphqlClient({
      config: this.defaultHeaders,
      baseURL: '/api/graphql'
    })

    this.grapqhClient.send(AUTH, {}, {
      success: (data)=>{

        const user = data.messenger.user

        if (user.session_id){
          this.checkCookie(user.session_id)        
        }else{
          deleteCookie("chaskiq_session_id")  
        }
         
        const messenger = new Hermessenger(
          Object.assign({}, data.messenger.user, {
            encData: this.props.data,
            encryptedMode: true,
            domain: this.props.domain,
            ws: this.props.ws,
            locale: this.props.lang
          })
        )

        messenger.render()


      },
      errors: ()=>{
        debugger
      }
    })

  }
} 