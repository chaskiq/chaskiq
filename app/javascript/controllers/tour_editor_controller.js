import { Controller } from '@hotwired/stimulus';
import { destroy } from '@rails/request.js';

// a bridge between the server (tour_editor_client) and the messenger tour (tour_manager)
export default class extends Controller {
  static targets = ['cssPath', 'stepsWrapper', 'preview'];

  connect() {
    console.log('TOUR EDITOR LOADED!');
  }

  initialize() {
    this.state = {};

    window.addEventListener('message', this.tourManagerEvents.bind(this));

    // event received from custom event when form is submitted & saved
    document.addEventListener('ChaskiqTourEvent', (e) => {
      this.stopTour();
    });
  }

  disconnect() {}

  async sendDelete(e) {
    e.stopPropagation();
    const response = await destroy(e.currentTarget.dataset.url, {
      body: {},
      responseKind: 'turbo-stream',
    });

    if (response.ok) {
      //const body = await response.html
      console.log('response!');
    }
  }

  tourManagerEvents(e) {
    console.log('STATE CHANGES', e);
    this.setState(e.data.state);
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };

    this.updateRender();
  }

  updateRender() {
    if (this.state.isCollapsed) {
      this.stepsWrapperTarget.classList.add('hidden');
    } else {
      this.stepsWrapperTarget.classList.remove('hidden');
    }

    this.cssPathTarget.innerHTML = this.state.cssPath;

    // this.previewTarget.innerHTML = JSON.stringify(this.state)
  }

  disablePreview(e) {
    window.parent.postMessage(
      {
        type: 'chaskiq:tours',
        action: 'disablePreview',
      },
      '*'
    );
  }

  stopTour(e) {
    window.parent.postMessage(
      {
        type: 'chaskiq:tours',
        action: 'stopTour',
      },
      '*'
    );
  }

  editStep(e) {
    window.parent.postMessage(
      {
        type: 'chaskiq:tours',
        action: 'editStep',
        url: e.currentTarget.dataset.url,
        target: e.currentTarget.dataset.target,
      },
      '*'
    );
  }

  removeItem(e) {
    e.stopPropagation();
    window.parent.postMessage(
      {
        type: 'chaskiq:tours',
        action: 'removeItem',
      },
      '*'
    );
  }

  activatePreview(e) {
    debugger
    window.parent.postMessage(
      {
        type: 'chaskiq:tours',
        action: 'activatePreview',
      },
      '*'
    );
  }

  handleSaveTour(e) {
    window.parent.postMessage(
      {
        type: 'chaskiq:tours',
        action: 'saveTour',
      },
      '*'
    );
  }

  addStep(e) {
    window.parent.postMessage(
      {
        type: 'chaskiq:tours',
        action: 'addStep',
        url: e.currentTarget.dataset.url,
      },
      '*'
    );
  }
}
