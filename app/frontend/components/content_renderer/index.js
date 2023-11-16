import './index.css'

// Add a Stimulus controller for this component.
// It will automatically registered and its name will be available
// via #component_name in the component class.
//
import { Controller as BaseController } from '@hotwired/stimulus'
import { post } from '@rails/request.js'

export default class Controller extends BaseController {
  initialize() {
    this.sendData()
  }

  disconnect() {}

  async sendData() {
    const response = await post(this.element.dataset.url, {
      body: this.element.dataset.values,
      responseKind: 'html', //'turbo-stream'
    })

    if (response.ok) {
      const body = await response.html
      this.element.closest('.definition-renderer').outerHTML = body
    }
  }
}
