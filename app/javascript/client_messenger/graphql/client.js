import axios from 'axios'
import { isObject, isEmpty } from 'lodash'

class GraphqlClient {
  constructor (props) {
    this.config = props.config
    this.axiosInstance = axios.create({
      baseURL: props.baseURL
    })
    return this
  }

  send = (query, variables, callbacks) => {
    this.axiosInstance.post('', {
      query: query,
      variables: variables
    }, { headers: this.config })
      .then(res => {
        const data = res.data.data
        const errors = res.data.errors
        if (isObject(errors) && !isEmpty(errors)) {
          if (callbacks.error) { return callbacks.error(res, errors) }
        }

        callbacks.success && callbacks.success(data, res)
      })
      .catch((req, error) => {
        console.log(req, error)
        switch (req.response.status) {
          case 500:
          // store.dispatch(errorMessage("server error ocurred"))
            break
          case 401:
          // store.dispatch(errorMessage("session expired"))
          // store.dispatch(expireAuthentication())
            break
          default:
            break
        }

        callbacks.fatal && callbacks.fatal(error)
      })
      .then((_r) => {
        callbacks.always && callbacks.always()
      })
  }
}

export default GraphqlClient
