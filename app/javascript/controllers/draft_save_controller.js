import { Controller } from '@hotwired/stimulus';
import { put } from '@rails/request.js';

export default class extends Controller {
  connect() {}

  async submit() {
    const formData = new FormData(this.element);
    formData.append('draft', 'true');

    const response = await put(this.element.action, {
      body: formData,
      responseKind: 'turbo-stream',
    });

    if (response.ok) {
      //const body = await response.html
      console.log('response!');
    }
  }
}
