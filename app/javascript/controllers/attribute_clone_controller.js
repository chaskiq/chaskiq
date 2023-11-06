import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  static targets = ['inputToggle', 'radio'];

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

  prevent(e) {
    e.preventDefault();
    e.stopPropagation();

    const el = document.querySelector(this.element.dataset.cloneTo);

    console.log('prevent');
    if (this.radioTarget.checked) {
      this.radioTarget.checked = false;
      el.value = null;
      console.log('prevent propagation');
    } else {
      this.radioTarget.checked = true;
      const value = this.radioTarget.value;
      el.value = value ? value : '';
    }

    el.dispatchEvent(new Event('change'));
  }

  cloneTo(e) {
    e.preventDefault();
    const el = document.querySelector(e.currentTarget.dataset.cloneTo);
    const data = this.element.dataset.value || this.element.value;

    if (el.value === data) {
      el.value = null;
    } else {
      el.value = data ? data : '';
    }

    el.dispatchEvent(new Event('change'));
  }
}
