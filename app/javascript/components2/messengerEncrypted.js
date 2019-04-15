import axios from 'axios'

export default class HermessengerEncrypted {

  constructor(props) {
    this.props = props

    const data = {
      referrer: window.location.path,
      email: this.props.email,
      properties: this.props.properties
    }

    this.defaultHeaders = {
      enc_data: this.props.data,
      user_data: JSON.stringify(data)
    }


    this.axiosInstance = axios.create({
      baseURL: `${this.props.domain}`,
      headers: this.defaultHeaders
    });

    this.axiosInstance.post(`/api/v1/apps/${this.props.app_id}/auth`).then((response) => {
      const messenger = new Hermessenger(Object.assign({}, response.data, {
        encData: this.props.data,
        encryptedMode: true 
      }))
      messenger.render()
    })
    .catch((error) => {
        console.log(error);
    });
  }
} 