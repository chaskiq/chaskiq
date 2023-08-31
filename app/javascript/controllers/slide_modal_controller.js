import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  static targets = ['container', 'form'];

  connect() {}

  disconnect() {
    this.close();
  }

  open(e) {
    this.containerTarget.classList.remove('hidden');
  }

  close(e) {
    this.containerTarget.classList.add('hidden');
    document.getElementById('slide-modal').innerHTML = null;
    document.getElementById('slide-modal').src = null;
  }

  closeWithKeyboard(e) {
    /*if (
      e.keyCode === 27 &&
      !this.containerTarget.classList.contains(this.toggleClass)
    ) {
      this.close(e)
    }*/
  }
}
