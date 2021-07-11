import { Controller } from 'stimulus'
import { patch } from '@rails/request.js'

export default class extends Controller {
  connect() {
    console.log("Listening for notifications", this.element.dataset)
    this.pling = new Audio('/sounds/BLIB.wav')

    if(this.element.dataset.read == "false" && this.element.dataset.notified === "true"){
      this.playSound()
      this.chatEditorController.scrollToBottom()
      this.markAsRead()
    }

    if (this.element.dataset.read === "false" && this.element.dataset.notified === "false"){
      console.log("NEEDS READ REQ")
      this.markAsRead()
    }
  }

  playSound(){
    this.pling.volume = 0.4
    this.pling.play()
  }

  async markAsRead() {
    const response = await patch(this.element.dataset.path, {
      body: JSON.stringify( {
        read: true
      })
    })

    if (response.ok) {
      console.log("seems ok!")
    }
  }

  get chatEditorController() {
    return this.application.getControllerForElementAndIdentifier(
      document.querySelector("[data-controller=chat-editor]"), "chat-editor"
    )
  }
}
