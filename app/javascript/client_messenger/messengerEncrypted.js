import axios from 'axios'
import Hermessenger from './messengerJss'
import {setCookie, getCookie, deleteCookie} from './cookies'

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
      enc_data: this.props.data,
      user_data: JSON.stringify(data),
      session_id: this.getSession()
    }

    this.axiosInstance = axios.create({
      baseURL: `${this.props.domain}`,
      headers: this.defaultHeaders
    });

    this.axiosInstance.post(`/api/v1/apps/${this.props.app_id}/auth`)
    .then((response) => {

      if (response.data.session_id){
        this.checkCookie(response.data.session_id)        
      }else{
        deleteCookie("chaskiq_session_id")  
      }
       
      const messenger = new Hermessenger(
        Object.assign({}, response.data, {
          encData: this.props.data,
          encryptedMode: true,
          domain: this.props.domain,
          ws: this.props.ws
        }) )
      messenger.render()
    })
    .catch((error) => {
        console.log("ERRR", error);
    });
  }
} 