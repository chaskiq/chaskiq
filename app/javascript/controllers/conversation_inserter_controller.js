import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  static targets = ['content'];

  connect() {
    console.log('inserter loaded!!');
  }

  insert(e) {
    e.preventDefault();
    let editorElement = document.querySelector(
      '[data-controller="chat-editor"]'
    );
    let editorController =
      this.application.getControllerForElementAndIdentifier(
        editorElement,
        'chat-editor'
      );
    let data = this.element.dataset;
    if (this.hasContentTarget) {
      data = { ...data, content: this.contentTarget.value };
    }
    editorController.insertResource(data);
  }
}
