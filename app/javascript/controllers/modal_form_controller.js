
import { Controller } from 'stimulus'

export default class extends Controller {
  static targets = ['container', 'form']

  connect() {
    this.element.addEventListener("turbo:submit-end", (event) => {
      this.next(event)
    })
  }

  next(event) {
    if (event.detail.success) {
      this.modalController.close()
      // console.log(event.detail.fetchResponse.response.url)
      // Turbo.visit(event.detail.fetchResponse.response.url) // THIS WILL FOLLOW REDIRECT
    } else {
      console.log("MODAL RENDER ERROR")
    }
  }

  disconnect() {
  }

  open(e) {
    this.containerTarget.classList.remove("hidden")
  }

  get modalController() {
    return this.application.getControllerForElementAndIdentifier(
      document.querySelector("#main-page"), "modal"
    )
  }

}
