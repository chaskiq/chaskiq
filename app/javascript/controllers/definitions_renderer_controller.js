import { Controller } from 'stimulus';

export default class extends Controller {
  static targets = ['form'];

  connect() {
    console.log('DEFINITIONSSSSNNSNS');
  }

  dispatchAction(e) {
    console.log('DISPATCHED on ', this.formTarget, e);
  }
}
