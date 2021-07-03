import { Controller } from 'stimulus'

export default class extends Controller {
  static targets = ['radio', 'newElement']

  connect() {
    //this.element.textContent = "Hello World!"
  }

  delete(e) {
    const target = e.target
    document.getElementById(target.dataset.segment).remove()
    this.element.requestSubmit()
  }

  addField(e) {
    const target = e.currentTarget
    console.log(target)
    console.log(this.newElementTarget)
    this.newElementTarget.value = target.dataset.field
    this.element.requestSubmit()
  }
}
