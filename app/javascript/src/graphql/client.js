import axios from 'axios';
import {isObject, isEmpty} from 'lodash'
import store from '../store'
import {errorMessage, successMessage} from '../actions/status_messages'
import {expireAuthentication} from '../actions/auth'


const graphql = (query, variables, callbacks)=>{

  const auth = store.getState().auth

  const config = {
    //"access-token": auth.accessToken,
    //"token-type":   "Bearer",
    //"client":       auth.client,
    //"expiry":       auth.expiry,
    //"uid":          auth.uid,
    "authorization": `Bearer ${auth.accessToken}`
  }

  axios.create({
    baseURL: '/graphql',
  }).post('', {
    query: query,
    variables: variables,
    
  }, {headers: config})
  .then( r => {
    const data = r.data.data
    const res = r
  
    const errors = r.data.errors //? r.data.errors[0].message : null
    // get first key of data and check if has errors
    //const errors = data[Object.keys(data)[0]].errors || r.data.errors

    if (isObject(errors) && !isEmpty(errors)) {
      //const errors = data[Object.keys(data)[0]];
      //callbacks['error'] ? callbacks['error'](res, errors['errors']) : null
      if(callbacks['error'])
        return callbacks['error'](res, errors)
    }
    
    callbacks['success'] ? callbacks['success'](data, res) : null
  })
  .catch(( req, error )=> {
    //throw r
    //const res = r.response
    //console.log(req, error)
    switch (req.response.status) {
      case 500:
        store.dispatch(errorMessage("server error ocurred"))
        break;
      case 401:
        store.dispatch(errorMessage("session expired"))
        store.dispatch(expireAuthentication())
        break;
      default:
        break;
    }
    
    callbacks['fatal'] ? callbacks['fatal'](error) : null
  })
  .then( (r) => {
    callbacks['always'] ? callbacks['always']() : null
  });
}

export default graphql
