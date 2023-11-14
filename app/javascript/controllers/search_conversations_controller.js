import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  connect() {}

  handleChange(e) {
    console.log('CHANGE CHANCNEWNE', e);

    this.element.requestSubmit();
  }
}
