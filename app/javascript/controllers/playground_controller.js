import { Controller } from '@hotwired/stimulus';
import { FetchRequest } from '@rails/request.js';

export default class extends Controller {
  static targets = ['codemirror', 'errors'];

  connect() {
    this.initializeCodeMirror();
  }

  initializeCodeMirror() {
    // Assuming you want a simple textarea-based CodeMirror instance

    const editor = window.CodeMirror(this.codemirrorTarget, {
      lineNumbers: true,
      matchBrackets: true,
      autoCloseBrackets: true,
      mode: 'application/ld+json',
      lineWrapping: true,
      tabSize: 2,
      value: '[]',
      theme: 'dracula',
    });

    // Listen for changes on the editor
    editor.on('change', this.handleCodeChange.bind(this));
  }

  displayError(err) {
    this.errorsTarget.classList.remove('hidden');
    this.errorsTarget.innerHTML = err;
  }

  hideError() {
    this.errorsTarget.classList.add('hidden');
    this.errorsTarget.innerHTML = '';
  }

  handleCodeChange(e) {
    //const code = this.editor.getValue();

    const val = e.getDoc().getValue();
    try {
      JSON.parse(val);
      this.hideError();
    } catch (error) {
      //setErr(error.message);
      console.log('ERORR SKIP', error);
      this.displayError(error);
      return;
    }

    //setErr(null);
    console.log(val);
    //setBlocks(val);

    // Create a PUT request to update the turbo-frame
    this.updateTurboFrame(val);
  }

  async updateTurboFrame(code) {
    const url = '/path_to_your_update_endpoint'; // The endpoint where you handle the code update
    const data = {
      code: code, // The updated code from the editor
    };

    const req = new FetchRequest('PUT', url, {
      body: JSON.stringify(data),
      responseKind: 'turbo-stream', // Assuming you're returning a turbo-stream response
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await req.perform();
    if (response.ok) {
      // You can handle successful PUT request here if needed
    } else {
      // Handle any errors
    }
  }
}
