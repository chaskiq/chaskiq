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
		this.sendData()
	}

	disconnect() {
	}

	async sendData(){
		const response = await post(
			this.element.dataset.url, { 
				body: this.element.dataset.values,
				responseKind: 'html' //'turbo-stream'
			})
		if (response.ok) {
			const body = await response.html
			// this.element.innerHTML = body
			this.element.closest("[data-controller='definition_renderer']").outerHTML = body
			console.log("response!")
		}
	}
}
