import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  connect() {}

  handleChange(e) {
    this.element.requestSubmit();
  }
}
