import { Controller } from '@hotwired/stimulus';
export default class extends Controller {
  static targets = ['container', 'form'];

  connect() {
    document.addEventListener('modal-close', this.close.bind(this));
  }

  disconnect() {
    this.close();
  }

  open(e) {
    this.containerTarget.classList.remove('hidden');
  }

  close(event) {
    //if (event.currentTarget.classList.contains('fixed')) {
    this.element.style.display = 'none';
    //}
  }

  /*close(e) {
    this.containerTarget.classList.add('hidden');
    document.getElementById('modal').innerHTML = null;
    document.getElementById('modal').src = null;
  }*/

  closeWithKeyboard(e) {
    /*if (
      e.keyCode === 27 &&
      !this.containerTarget.classList.contains(this.toggleClass)
    ) {
      this.close(e)
    }*/
  }
}
