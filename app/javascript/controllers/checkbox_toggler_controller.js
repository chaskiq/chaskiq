import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["hint", "elementToToggle", "checkbox"];

  connect() {
    this.updateHint();
    this.toggleElement();
  }

  toggle() {
    this.updateHint();
    this.toggleElement();
  }

  updateHint() {
    if (this.checkboxTarget.checked) {
      this.hintTarget.innerText = this.hintTarget.dataset.selectedHint;
    } else {
      this.hintTarget.innerText = this.hintTarget.dataset.defaultHint;
    }
  }

  toggleElement() {
    if (this.checkboxTarget.checked) {
      this.elementToToggleTarget.classList.remove("hidden");
    } else {
      this.elementToToggleTarget.classList.add("hidden");
    }
  }

  get checkbox() {
    return this.element;
  }
}