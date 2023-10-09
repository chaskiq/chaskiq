import { Controller } from '@hotwired/stimulus';
import { patch } from '@rails/request.js';

export default class extends Controller {
  initialize() {
    // console.log("Listening for notifications", this.element.dataset)
    this.pling = new Audio('/sounds/BLIB.wav');
    if (this.element.dataset.read == 'false') {
      this.playSound();
      this.chatEditorController?.scrollToBottom();
      this.chatMessengerController?.scrollToBottom();
      this.markAsRead();
      this.sendEvent({});
    }
  }

  playSound() {
    this.pling.volume = 0.4;
    this.pling.play();
  }

  async markAsRead() {
    if (!this.element.dataset.path) return;
    if (this.element.dataset.author == this.element.dataset.viewerType) return;

    const response = await patch(this.element.dataset.path, {
      body: JSON.stringify({
        read: true,
      }),
    });

    if (response.ok) {
      console.log('seems ok!');
    }
  }

  async sendEvent(results, options = {}) {
    if (this.element.dataset.viewerType === 'Agent') return;
    const { stepId, triggerId, path } = this.element.dataset;

    const data = {
      event_type: 'receive_conversation_part',
      //conversation_key: this.props.conversation.key,
      //message_key: this.props.data.key,
      step: stepId,
      trigger: triggerId,
      ...results,
    };

    // do nothing if wait_for_input
    if (!options.force && this.element.dataset.blockKind === 'wait_for_input')
      return;

    //this.chatMessengerController().pushEvent(path, data)

    const response = await patch(path, {
      body: JSON.stringify(data),
    });

    if (response.ok) {
      console.log('seems ok!');
    }
  }

  get chatMessengerController() {
    return this.application.getControllerForElementAndIdentifier(
      document.querySelector('[data-controller=messenger]'),
      'messenger'
    );
  }

  get chatEditorController() {
    return this.application.getControllerForElementAndIdentifier(
      document.querySelector('[data-controller=chat-editor]'),
      'chat-editor'
    );
  }
}
