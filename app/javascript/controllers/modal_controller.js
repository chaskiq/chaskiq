import { Controller } from 'stimulus';
import { FetchRequest } from '@rails/request.js';
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

  close(e) {
    this.containerTarget.classList.add('hidden');
    document.getElementById('modal').innerHTML = null;
    document.getElementById('modal').src = null;
  }

  closeWithKeyboard(e) {
    /*if (
      e.keyCode === 27 &&
      !this.containerTarget.classList.contains(this.toggleClass)
    ) {
      this.close(e)
    }*/
  }

  // not used

  submit(e) {
    console.log('THIS DOES NOTHINF!');
  }

  async sendPost(data) {
    const method = data._method ? data._method : this.formTarget.method;
    const req = new FetchRequest(method, this.formTarget.action, {
      body: JSON.stringify(data),
      responseKind: 'turbo-stream',
    });
    const response = await req.perform();
    if (response.ok) {
      console.log('HEY HET HEY');
    }
  }
}
