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
        el.remove()
      }
    )

    const classNames = `mb-3 p-1 border max-w-xs rounded-md shadow-sm form-input 
    block w-full transition duration-150 ease-in-out 
    sm:text-sm sm:leading-5
    dark:text-gray-100 dark:bg-gray-900
    `

    const inputType =
      e.target.dataset.attributeType === 'date' ? 'number' : 'text'
    // add element
    e.target.insertAdjacentHTML(
      'afterend',
      `
      <div class="checkbox-input">
        <input
          class="${classNames}"
          value="${this.valueInputTarget.value}" 
          type="${inputType}" 
          data-action="change->segment-manager-input#copyText"
        />
      </div>
    `
    )
  }

  copyText(e) {
    this.valueInputTarget.value = e.target.value
  }
}
