import axios from 'axios';
import _ from 'lodash'




const graphql = (query, variables, callbacks)=>{

  const auth = window.store.getState().auth

  const config = {
    "access-token": auth.accessToken,
    "token-type":   "Bearer",
    "client":       auth.client,
    "expiry":       auth.expiry,
    "uid":          auth.uid,
    "authorization": auth.jwt
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

    if (_.isObject(errors) && !_.isEmpty(errors)) {
      //const errors = data[Object.keys(data)[0]];
      //callbacks['error'] ? callbacks['error'](res, errors['errors']) : null
      if(callbacks['error'])
        return callbacks['error'](res, errors)
    }

    callbacks['success'] ? callbacks['success'](data, res) : null
  })
  .catch( r => {
    //throw r
    //const res = r.response
    callbacks['fatal'] ? callbacks['fatal'](r) : null
  })
  .then( () => {
    callbacks['always'] ? callbacks['always']() : null
  });
}

export default graphql
