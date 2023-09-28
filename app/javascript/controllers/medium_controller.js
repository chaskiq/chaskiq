import mediumZoom from 'medium-zoom';

import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  initialize() {
    mediumZoom(this.element.querySelectorAll('.medium-zoom-image'));
  }
}
