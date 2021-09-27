import { Controller } from 'stimulus';

export default class extends Controller {
  static targets = ['inputToggle'];

  connect() {
    if (this.element.dataset.cloneFrom) {
      this.clone();
    }
  }

  clone() {
    const el = document.querySelector(this.element.dataset.cloneFrom);
    const data = el.dataset.value;
    this.element.value = data;
    this.element.dispatchEvent(new Event('change'));
  }

  cloneTo(e) {
    e.preventDefault();
    const el = document.querySelector(e.currentTarget.dataset.cloneTo);
    const data = this.element.dataset.value || this.element.value;
    el.value = data ? data : '';
    el.dispatchEvent(new Event('change'));
  }
}
