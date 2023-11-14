import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  static targets = ['patternInput', 'patternHolder'];

  connect() {}

  selectPattern(e) {
    e.preventDefault();
    const { pattern } = e.currentTarget.dataset;
    console.log(pattern, this.patternInputTarget, this.patternHolderTarget);

    this.patternInputTarget.value = pattern;
    this.patternHolderTarget.src = pattern;
  }
}
