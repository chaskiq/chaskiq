// custom_event_controller.js
import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  connect() {
    this.sendCustomEvent();
  }

  sendCustomEvent() {
    const eventData = this.element.dataset.values;
    const eventName = this.element.dataset.eventName || 'ChaskiqEvent';
    console.log('SENDING CUSTOM EVENT TO MESSENGER', eventName, eventData);
    const event = new CustomEvent(eventName, {
      detail: { data: eventData },
      bubbles: true,
    });
    this.element.dispatchEvent(event);
  }
}
