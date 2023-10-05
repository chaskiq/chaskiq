// custom_event_controller.js
import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  connect() {
    this.sendCustomEvent();
  }

  sendCustomEvent() {
    const eventData = this.element.dataset.values;
    const event = new CustomEvent("ChaskiqEvent", {
      detail: { data: eventData },
      bubbles: true,
    });
    this.element.dispatchEvent(event);
  }
}