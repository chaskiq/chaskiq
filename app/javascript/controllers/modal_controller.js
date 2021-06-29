
import { Controller } from 'stimulus'
import { useMutation } from 'stimulus-use'
import { post, put, FetchRequest } from '@rails/request.js'
import serialize from 'form-serialize'
import * as Turbo from "@hotwired/turbo"

export default class extends Controller {
  static targets = ['container', 'form']

  connect() {
    this.element.addEventListener("turbo:submit-end", (event) => {
      this.next(event)
    })
  }

  next(event) {
    if (event.detail.success) {
      this.close()
      // console.log(event.detail.fetchResponse.response.url)
      // Turbo.visit(event.detail.fetchResponse.response.url) // THIS WILL FOLLOW REDIRECT
    } else {
      console.log("MODAL RENDER ERROR")
    }
  }

  disconnect() {
    this.close()
  }

  submit(e){
    console.log("THIS DOES NOTHINF!")
  }

  submitOld(e) {
    e.preventDefault()
    console.log("SUBMIT HERE!")

    let data = serialize(this.formTarget, { hash: true })

    const frame = document.getElementById("modal");

    frame.loaded.then(
      (success)=> {
        // some actions after frame rendered
        console.log("LOADED FRAME", success)
      },  
      (error)=>{
        console.log("ERROR FRAME", error)
      }
    );

    this.sendPost(data)

    //this.formTarget.requestSubmit()

  }

  async sendPost(data){
    const method = data._method ? data._method : this.formTarget.method
    const req = new FetchRequest(
      method, 
      this.formTarget.action, 
      {
        body: JSON.stringify(data),
        responseKind: 'turbo-stream',
      }
    )
    const response = await req.perform()
    if (response.ok) {
      console.log("HEY HET HEY")
    }
  }

  test(){
    debugger
  }

  open(e) {
    this.containerTarget.classList.remove("hidden")
  }

  close(e) {
    this.containerTarget.classList.add("hidden")
    document.getElementById('modal').innerHTML = null
    document.getElementById("modal").src = null
  }

  closeWithKeyboard(e) {
    /*if (
      e.keyCode === 27 &&
      !this.containerTarget.classList.contains(this.toggleClass)
    ) {
      this.close(e)
    }*/
  }

  mutate(entries) {
    console.log('mutate mier')
    for (const mutation of entries) {
      if (mutation.type === 'childList') {
        console.log('A child node has been added or removed.')
      } else if (mutation.target === this.element) {
        console.log('The root element of this controller was modified.')
      } else if (mutation.type === 'attributes') {
        this.listenLinks()
        console.log(
          'The ' + mutation.attributeName + ' attribute was modified.'
        )
      }
    }
  }
}
