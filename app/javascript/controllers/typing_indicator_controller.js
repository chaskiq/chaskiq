import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  static targets = ['indicator'];

  initialize() {
    this.showIndicator();
    this.debounce(this.hideIndicator, 1000);
  }

  showIndicator() {
    this.indicatorTarget.classList.remove('hidden');
  }

  hideIndicator = () => {
    this.indicatorTarget.classList.add('hidden');
  };

  debounce(func, delay) {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(func, delay);
  }
}
