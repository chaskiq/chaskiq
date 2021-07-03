import { Controller } from 'stimulus'

export default class extends Controller {
  static targets = ['inputToggle']

  connect() {
		this.clone()
  }

	clone(){
		const el = document.querySelector(this.element.dataset.cloneFrom)
		const data = el.dataset.predicates
    this.element.value = data
	}
}