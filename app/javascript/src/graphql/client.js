import axios from 'axios';
import _ from 'lodash'

const graphql = (query, variables, callbacks)=>{
  axios.create({
    baseURL: '/graphql',
  }).post('', {
    query: query,
    variables: variables
  })
  .then( r => {
    const data = r.data.data
    const res = r
  
    const errors = r.data.errors ? r.data.errors[0].messages : null
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
    throw r
    //const res = r.response
    callbacks['error'] ? callbacks['error'](r) : null
  })
  .then( () => {
    callbacks['always'] ? callbacks['always']() : null
  });
}

export default graphql
