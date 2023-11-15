import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  static targets = ['conversationPart'];

  connect() {
    this.observer = new MutationObserver((mutations) =>
      this.onMutation(mutations)
    );
    this.observeConversation();
    this.checkForInput();
  }

  disconnect() {
    this.observer.disconnect();
  }

  observeConversation() {
    const conversationElement = this.element;
    console.log('OVSERVE', this.element);
    this.observer.observe(conversationElement, { childList: true });
  }

  onMutation(mutations) {
    mutations.forEach((mutation) => {
      console.log(mutation);
      if (mutation.type === 'childList') {
        // Handle added or removed conversation parts
        this.handleConversationChange();
      }
    });
    this.handleConversationChange();
    console.log('mutation observed cycle');
  }

  handleConversationChange() {
    // Your logic here, executed when conversation parts change
    console.log('Conversation parts have changed.');
    this.checkForInput();
  }

  checkForInput() {
    const state = this.isInputEnabled();
    if (state) {
      document.getElementById('chat-editor').classList.remove('hidden');
    } else {
      document.getElementById('chat-editor').classList.add('hidden');
    }

    console.log('INPUT RNABLED', state);
  }

  isInputEnabled() {
    const conversationData = this.element.dataset;

    if (conversationData.closed === 'true') return true;

    if (!this.hasConversationPartTarget) return true;

    /*if(!this.hasConversationTarget) return
    
    if (this.conversationTarget.closed === 'closed') {
      if (isInboundRepliesClosed()) {
        return false;
      }
      return false
    }*/

    //if (isEmpty(conversation.messages)) return true;

    /*const messages = conversation.messages.collection;
    if (messages.length === 0) return true;

    const message = messages[0].message;
    if (isEmpty(message.blocks)) return true;
    if (message.blocks && message.blocks.type === 'wait_for_reply') return true;

    // strict comparison of false
    if (message.blocks && message.blocks.wait_for_input === false) return true;
    if (message.blocks && message.blocks.waitForInput === false) return true;*/
    const message = this.conversationPartTargets[0];

    const data = message.dataset;

    if (data.blockKind === 'app_package' || data.blockKind === 'ask_option') {
      if (data.replied === 'true') return true;
      return false;
    }

    return true;
  }
}
