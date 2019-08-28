import axios from 'axios';
import _ from 'lodash'



class GraphqlClient {
  constructor(props){
    this.config = props.config
    this.axiosInstance = axios.create({
      baseURL: props.baseURL,
    })
    return this
  }

  send = (query, variables, callbacks)=>{
    this.axiosInstance.post('', {
      query: query,
      variables: variables,
    }, {headers: this.config})
    .then( r => {
      const data = r.data.data
      const res = r
    
      const errors = r.data.errors
      if (_.isObject(errors) && !_.isEmpty(errors)) {
        //const errors = data[Object.keys(data)[0]];
        //callbacks['error'] ? callbacks['error'](res, errors['errors']) : null
        if(callbacks['error'])
          return callbacks['error'](res, errors)
      }
      
      callbacks['success'] ? callbacks['success'](data, res) : null
    })
    .catch(( req, error )=> {
      console.log(req, error)
      switch (req.response.status) {
        case 500:
          //store.dispatch(errorMessage("server error ocurred"))
          break;
        case 401:
          //store.dispatch(errorMessage("session expired"))
          //store.dispatch(expireAuthentication())
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
}

export default GraphqlClient
