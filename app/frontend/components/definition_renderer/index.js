import './index.css'
import { Controller as BaseController } from '@hotwired/stimulus'
import { post } from '@rails/request.js'
import serialize from 'form-serialize'

export default class Controller extends BaseController {
  static targets = ['form']

  connect() {
    // console.log('definition renderer controller activated')
  }

  disconnect() {}

  onSubmit(e) {
    // console.log('PReventinf default on definition form submit')
    e.preventDefault()
  }


  // from buttons
  async sendForm(e) {
    e.preventDefault()

    let formData = serialize(this.formTarget, { hash: true, empty: true })

    const field = JSON.parse(e.currentTarget.dataset.fieldJson);
    let data = {
      ctx: {
        field: field,
        ...formData.message, // Spread the contents of formData.message into ctx
        values: { ...formData } // Start with a shallow copy of formData
      }
    };

    // Delete the message key from the values object since it's already spread into ctx
    delete data.ctx.values.message;
      
    // console.log("DATA", data)
    // console.log(field.action.type)
    // console.log("GO TO:", this.formTarget.dataset )
    
    const kk = this.formTarget.dataset.kind || field.action.type

    // this.formTarget.dataset.kind
    const response = await post(this.resolvePath(kk), {
      body: JSON.stringify(data),
      responseKind: 'turbo-stream'
    })

    if (response.ok) {
      if (response.isTurboStream){
        const body = await response.turbo
        if(response.response.status !== 202){
          const closeEvent = new Event('modal-close')
          document.dispatchEvent(closeEvent)
        }
      } else {
        const bodyHtml = await response.html
        // custom event que será leido por modal controller
        this.element.outerHTML = bodyHtml
      }
    }
  }

  openUrl(e){
    const data = JSON.parse(e.currentTarget.dataset.fieldJson)
    const url = data?.action?.url
    if(!url) return
    window.open(url, '_blank')
  }

  resolvePath(kind){
     switch (kind) {
      case 'configure':
        return this.configurePath()  
      case 'submit':
        return this.submitPath() 
      case 'content':
        return this.contentPath()  
      case 'frame':
        return this.framePath() 
      default:
        break;
    }
  }

  get chatMessengerController() {
    return this.application.getControllerForElementAndIdentifier(
      document.querySelector('[data-controller=messenger]'),
      'messenger'
    );
  }

  visitLink(e) {
    e.preventDefault()
    const json = JSON.parse(e.currentTarget.dataset.fieldJson)
    const url = e.currentTarget.dataset.actionUrl
    window.location = url || json?.action?.url
  }

  visitFrame(e) {
    e.preventDefault()

    let formData = serialize(this.formTarget, { hash: true, empty: true })

    const field = JSON.parse(e.currentTarget.dataset.fieldJson);
    let data = {
      ctx: {
        field: field,
        ...formData.message, // Spread the contents of formData.message into ctx
        values: { ...formData } // Start with a shallow copy of formData
      }
    };

    // Delete the message key from the values object since it's already spread into ctx
    delete data.ctx.values.message;
      
    const kk = this.formTarget.dataset.kind || field.action.type
    data.url = data.ctx?.field?.action?.url

    if(this.chatMessengerController){
      this.chatMessengerController.goToAppPackageFrame(data)
    }
  }

  openContent(e){
    e.preventDefault()
    const json = JSON.parse(e.currentTarget.dataset.fieldJson)
    this.sendForm(e)

  }

  configurePath() {
    return `${this.element.dataset.path}/configure`
  }

  submitPath() {
    return `${this.element.dataset.path}/submit`
  }

  contentPath() {
    return `${this.element.dataset.path}/content`
  }

  framePath() {
    return `${this.element.dataset.path}/frame`
  }

  async sendData(e) {
    console.log('SEND SUBMIT', e)
  }


  get modalController() {
    return this.application.getControllerForElementAndIdentifier(
      document.querySelector("#main-page"), "modal"
    )
  }
}
