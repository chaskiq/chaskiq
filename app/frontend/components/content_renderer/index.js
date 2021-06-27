import "./index.css"

// Add a Stimulus controller for this component.
// It will automatically registered and its name will be available
// via #component_name in the component class.
//
import { Controller as BaseController } from "stimulus";
import { post } from '@rails/request.js'

export class Controller extends BaseController {
	connect() {
		console.log("ajajajaja")
	}

	disconnect() {
	}

	async sendData(data, cb){
		const response = await post(
			this.element.dataset.url, { 
				body: JSON.stringify(data),
				responseKind: 'turbo-stream'
			})
		if (response.ok) {
			cb && cb()
		}
	}
}
