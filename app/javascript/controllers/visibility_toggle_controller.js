import { Controller } from 'stimulus';

export default class extends Controller {
  static targets = ['inputToggle'];

  connect() {
    //this.element.textContent = "Hello World!"
  }

  hide(e) {
    this.inputToggleTarget.classList.add('hidden');
  }

  show(e) {
    this.inputToggleTarget.classList.remove('hidden');
  }
}
