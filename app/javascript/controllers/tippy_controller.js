import { Controller } from 'stimulus'
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css'; // optional for styling

export default class extends Controller {
  connect() {
		tippy(this.element, {
			content: this.element.dataset.content,
			duration: 0,
			//arrow: false,
			//delay: [1000, 200],
		});
  }
}
