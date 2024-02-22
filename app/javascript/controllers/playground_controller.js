import { Controller } from '@hotwired/stimulus';
import { FetchRequest } from '@rails/request.js';

const defaultString = `
[	
  { 
    "type": "text",
    "text": "hello",
    "style": "header" 
  },
  { 
    "type": "text",
    "text": "This is a header",
    "style": "muted",
    "align": "center"
  }
]
`;

export default class extends Controller {
  static targets = ['codemirror', 'errors'];

  constructor(...args) {
    super(...args);
    this.debouncedUpdateTurboFrame = this.debounce(
      this.updateTurboFrame.bind(this),
      500
    );
  }

  debounce(func, wait) {
    let timeout;
    return function (...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }

  connect() {
    this.initializeCodeMirror();
  }

  initializeCodeMirror() {
    const defaultValue = localStorage.getItem('savedCode') || defaultString;

    const editor = window.CodeMirror(this.codemirrorTarget, {
      lineNumbers: true,
      matchBrackets: true,
      autoCloseBrackets: true,
      mode: 'application/ld+json',
      lineWrapping: true,
      tabSize: 2,
      value: defaultValue,
      theme: 'dracula',
    });

    editor.on('change', this.handleCodeChange.bind(this));

    this.updateTurboFrame(defaultValue);
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
    const val = e.getDoc().getValue();

    // Save the current code to localStorage
    localStorage.setItem('savedCode', val);

    try {
      JSON.parse(val);
      this.hideError();
    } catch (error) {
      this.displayError(error);
      return;
    }

    //this.updateTurboFrame(val);
    this.debouncedUpdateTurboFrame(val);
  }

  async updateTurboFrame(code) {
    const url = '/playground';
    const data = {
      code: code,
    };

    const req = new FetchRequest('PUT', url, {
      body: JSON.stringify(data),
      responseKind: 'turbo-stream',
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await req.perform();
    if (response.ok) {
      // Handle successful PUT request here if needed
    } else {
      // Handle errors
    }
  }
}
