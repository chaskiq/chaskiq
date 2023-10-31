import { Controller } from '@hotwired/stimulus';

export default class extends Controller {

  connect(){
    // console.log("connected user auto messenger")
    this.sendRead()
  }

  sendRead() {
    console.log("send read")
    const id = this.element.dataset.id
    const message = {
      action: "read",
      id: id
    }
    this.pushMessage(message)
  }

  dismiss(){
    console.log("dismiss")
    const id = this.element.dataset.id

    this.element.remove()

    const message = {
      action: "dismiss",
      id: id
    }
    this.pushMessage(message)

    const availableMessages = document.querySelectorAll(".user-auto-message")

    // console.log("AVAILABLE MESSAGES", availableMessages.length)

    if(availableMessages.length == 0){
      const data = {
        action: "removeFrame"
      }
      this.pushMessage(data)
    }
  }

  pushMessage(data){
    window.parent.postMessage(
      {
        type: 'chaskiq:user_auto_messages',
        data: data,
      },
      '*'
    );
  }
}
