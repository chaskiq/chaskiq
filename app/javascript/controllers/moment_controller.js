import { Controller } from '@hotwired/stimulus';
import moment from 'moment';

export default class extends Controller {
  initialize() {
    this.updateTimeAgo();
  }

  updateTimeAgo() {
    // Get the Unix timestamp from the `datetime` attribute
    let unixTimestamp = this.element.getAttribute('datetime');
    // Convert the Unix timestamp to a Moment.js object
    let time = moment.unix(unixTimestamp);
    // Update the text content with the relative time
    this.element.textContent = time.fromNow();
  }
}
