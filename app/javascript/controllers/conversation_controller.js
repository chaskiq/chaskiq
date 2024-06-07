import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  //static targets = ['contentframe'];

  initialize() {
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'complete'
        ) {
          if (this.element.hasAttribute('complete')) {
            this.loadingCompleted();
          }
        }
      });
    });

    this.observer.observe(this.element, {
      attributes: true,
    });
  }

  connect() {
    console.log('CONVERSAIOTN');
  }

  loadingCompleted() {
    this.scrollToBottom();
  }

  disconnect() {
    this.observer.disconnect();
  }

  scrollToBottom() {
    const overflow = document.getElementById('conversation-overflow');
    if(!overflow) return
    overflow.scrollTop = overflow.scrollHeight;
  }

  toggleSidebar() {
    const sidebar = document.getElementById('conversation-sidebar');
    //sidebar.classList.toggle('hidden')
    sidebar.classList.toggle('sm:block');
  }
}
