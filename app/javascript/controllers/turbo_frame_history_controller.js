import { Controller } from '@hotwired/stimulus';
import { useMutation } from 'stimulus-use';

export default class extends Controller {
  connect() {
    useMutation(this, { attributes: true });
    this.popStateListener = this.popStateListener.bind(this);
    window.addEventListener('popstate', this.popStateListener);
    // Make Turbo ignore popstate events for the initial state
    history.replaceState(this.historyState(), '', window.location.href);
  }

  disconnect() {
    window.removeEventListener('popstate', this.popStateListener);
  }

  mutate(entries) {
    entries.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
        const src = this.element.getAttribute('src');
        if (src != null && src !== window.location.href) {
          history.pushState(this.historyState(), '', src);
        }
      }
    });
  }

  popStateListener(event) {
    if (
      event.state.turbo_frame_history &&
      event.state.turbo_frame === this.element.id
    ) {
      this.element.src = window.location.href;
    }
  }

  historyState() {
    return {
      turbo_frame_history: true,
      turbo_frame: this.element.id,
    };
  }
}
