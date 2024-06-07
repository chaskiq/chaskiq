import { Controller } from '@hotwired/stimulus';

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

  toggleFields(e) {
    const mode = e.currentTarget.value;
    this.inputToggleTargets.forEach(field => {
      if (field.dataset.mode === mode) {
        field.disabled = false;
        field.parentElement.classList.remove("hidden");
      } else {
        field.disabled = true;
        field.parentElement.classList.add("hidden");
      }
    });
  }
}
