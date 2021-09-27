import { Controller } from 'stimulus';

export default class extends Controller {
  static targets = ['spinner'];

  connect() {}

  handleShow() {
    console.log('before fetch loader');
    this.spinnerTarget.classList.remove('hidden');
  }

  handleHide() {
    console.log('after fetch');
    this.spinnerTarget.classList.add('hidden');
  }

  disconnect() {}
}
