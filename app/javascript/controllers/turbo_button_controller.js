import { Controller } from 'stimulus';
import { Turbo } from '@hotwired/turbo-rails';

export default class extends Controller {
  connect() {}

  visit() {
    const url = this.element.dataset.url;
    Turbo.visit(url, { action: 'replace' });
  }
}
