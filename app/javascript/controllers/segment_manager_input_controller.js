import { Controller } from 'stimulus'

export default class extends Controller {
  static targets = ['valueInput']

  connect() {
    //this.element.textContent = "Hello World!"
  }

  tip(e) {
    Array.from(document.getElementsByClassName('checkbox-input')).forEach(
      (el) => {
        // Do stuff here
        el.classList.add("hidden")
      }
    )

    e.currentTarget.parentElement.querySelector(".checkbox-input").classList.remove("hidden")
  }

  copyText(e) {
    this.valueInputTarget.value = e.target.value
  }
}
