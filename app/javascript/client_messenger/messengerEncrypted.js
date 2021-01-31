import ChaskiqMessenger from './messenger'
import { setCookie, getCookie, deleteCookie } from './cookies'

import { AUTH } from './graphql/queries'
import GraphqlClient from './graphql/client'

export default class ChaskiqMessengerEncrypted {
  constructor (props) {
    this.props = props

    const currentLang = this.props.lang ||
                        navigator.language ||
                        navigator.userLanguage

    const data = {
      referrer: window.location.path,
      email: this.props.email,
      properties: this.props.properties
    }

    this.cookieNamespace = () => {
      // old app keys have hypens, we get rid of this
      const app_id = this.props.app_id.replace("-", "")
      return `chaskiq_session_id_${app_id}`
    }

    this.getSession = () => {
      // cookie rename, if we wet an old cookie update to new format and expire it
      const oldCookie = getCookie('chaskiq_session_id')
      if (getCookie('chaskiq_session_id')) {
        console.log('old cookie', oldCookie)
        this.checkCookie(oldCookie) // will append a appkey
        deleteCookie('chaskiq_session_id')
      }
      return getCookie(this.cookieNamespace()) || ''
    }

    this.checkCookie = (val) => {
      setCookie(this.cookieNamespace(), val, 365)
    }

    this.defaultHeaders = {
      app: this.props.app_id,
      'enc-data': this.props.data || '',
      'user-data': JSON.stringify(data),
      'session-id': this.getSession(),
      lang: currentLang
    }

    this.graphqlClient = new GraphqlClient({
      config: this.defaultHeaders,
      baseURL: `${this.props.domain}/api/graphql`
    })

    this.graphqlClient.send(AUTH, {
      lang: currentLang
    }, {
      success: (data) => {
        const user = data.messenger.user

        if (user.session_id) {
          this.checkCookie(user.session_id)
        } else {
          deleteCookie(this.cookieNamespace())
        }

        const messenger = new ChaskiqMessenger(
          Object.assign({}, user, {
            app_id: this.props.app_id,
            encData: this.props.data,
            encryptedMode: true,
            domain: this.props.domain,
            ws: this.props.ws,
            lang: user.lang,
            wrapperId: this.props.wrapperId || 'ChaskiqMessengerRoot'
          })
        )

        messenger.render()
      },
      errors: () => {
        debugger
      }
    })

    this.unload = () => {
      this.sendCommand('unload', {})
    }

    this.sendCommand = (action, data = {}) => {
      const event = new CustomEvent('chaskiq_events',
        {
          bubbles: true,
          detail: { action: action, data: data }
        })
      window.document.body.dispatchEvent(event)
    }
  }
}
