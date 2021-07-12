import { Controller } from 'stimulus'
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css'; // optional for styling

// https://atomiks.github.io/tippyjs/v6/all-props/#placement
export default class extends Controller {
  connect() {
		tippy(this.element, {
			content: this.element.dataset.content,
			duration: 0,
			placement: this.element.dataset.placement || 'top'
			//arrow: false,
			//delay: [1000, 200],
		});
  }
}
