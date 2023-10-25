import { Controller } from "@hotwired/stimulus";

export default class extends Controller {

  static targets = ["notice"]

  initialize() {
    console.log("CONNECTIVITY")
    this.online = navigator.onLine;
    this.wasOffline = false;
  }

  connect() {
    this.handleConnectionChange = this.handleConnectionChange.bind(this);
    window.addEventListener('online', this.handleConnectionChange);
    window.addEventListener('offline', this.handleConnectionChange);
  }

  disconnect() {
    window.removeEventListener('online', this.handleConnectionChange);
    window.removeEventListener('offline', this.handleConnectionChange);
  }

  handleConnectionChange() {
    this.online = navigator.onLine;

    if (this.online && this.wasOffline) {
      console.log('YES IT WAS OFFLINE!');
      // onReconnect equivalent logic here (if needed)
    }
    
    if (this.online) {
      this.wasOffline = false;
      console.log('>>>>>> HANDLE ONLINE!');
      this.noticeTarget.classList.add('hidden');
    } else {
      this.wasOffline = true;
      console.log('>>>>>> IS OFFLINE!');
      this.noticeTarget.classList.remove('hidden');
    }
  }
}
