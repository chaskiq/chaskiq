import { Controller } from 'stimulus';
import { useClickOutside } from 'stimulus-use';

export default class extends Controller {
  static targets = ['toggleable'];

  connect() {
    useClickOutside(this); //, { element: this.toggleableTarget })
  }

  toggle() {
    this.toggleableTarget.classList.toggle('hidden');
  }

  clickOutside(event) {
    // example to close a modal
    // event.preventDefault()
    this.toggleableTarget.classList.add('hidden');
  }
}
