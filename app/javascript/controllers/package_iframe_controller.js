import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  static targets = ['iframe'];

  connect() {
    this.writeIframe();
  }

  writeIframe() {
    var iframe = this.iframeTarget;
    var doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    var correctedHtml = this.element.dataset.html.replace(/\+/g, '%20');

    console.log(decodeURIComponent(correctedHtml));
    doc.write(decodeURIComponent(correctedHtml));
    doc.close();
  }
}
