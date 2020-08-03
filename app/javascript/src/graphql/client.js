import axios from 'axios'
import { isObject, isEmpty } from 'lodash'
import store from '../store'
import { errorMessage } from '../actions/status_messages'
import { expireAuthentication, refreshToken } from '../actions/auth'
//import history from "../history.js";

const graphql = (query, variables, callbacks) => {
  const {auth, current_user} = store.getState()

  const locale = current_user.lang || I18n.defaultLocale

  const config = {
    authorization: `Bearer ${auth.accessToken}`,
    lang: locale
  }

  axios.create({
    baseURL: '/graphql'
  }).post('', {
    query: query,
    variables: variables

  }, { headers: config })
    .then(r => {
      const data = r.data.data
      const res = r

      const errors = r.data.errors // ? r.data.errors[0].message : null
      // get first key of data and check if has errors
      // const errors = data[Object.keys(data)[0]].errors || r.data.errors

      if (isObject(errors) && !isEmpty(errors)) {
      // const errors = data[Object.keys(data)[0]];
      // callbacks['error'] ? callbacks['error'](res, errors['errors']) : null
        if (errors[0].extensions &&
          errors[0].extensions.code === 'unauthorized')
          return store.dispatch(errorMessage(errors[0].message))
        if (callbacks.error) {
          return callbacks.error(res, errors)
        }
      }

      callbacks.success ? callbacks.success(data, res) : null
    })
    .catch((req, error) => {
    // throw r
    // const res = r.response
    // console.log(req, error)
      switch (req.response.status) {
        case 500:
          store.dispatch(errorMessage('server error ocurred'))
          break
        case 401:
          console.log("AA: ", req.response)
          //history.push("/")
          store.dispatch(errorMessage('session expired'))
          store.dispatch(refreshToken(auth))
          //store.dispatch(expireAuthentication())
          //refreshToken(auth)
          break
        default:
          break
      }

      callbacks.fatal ? callbacks.fatal(error) : null
    })
    .then((r) => {
      callbacks.always ? callbacks.always() : null
    })
}



export default graphql
