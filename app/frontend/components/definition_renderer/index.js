import "./index.css"
import { Controller as BaseController } from "stimulus";
import { post } from '@rails/request.js'
import serialize from 'form-serialize'

export class Controller extends BaseController {
	static targets = [ "form" ] 

	connect() {
		console.log("definition renderer controller activated")
	}

	disconnect() {
	}

	onSubmit(e) {
		console.log("PReventinf default on definition form submit")
		e.preventDefault()
	}

	// from buttons
	async sendForm(e) {
		console.log("SEND FORM", e)
		e.preventDefault()

		let data = serialize(this.formTarget, { hash: true })
		const field = JSON.parse(e.currentTarget.dataset.fieldJson)
		data['ctx']['field'] = field
		// data['ctx']['values'] = data.ctx.values
		// console.log("DATA", data)
		const response = await post(
			this.submitPath(), { 
				body: JSON.stringify(data),
				responseKind: 'html' //'turbo-stream'
			})
		if (response.ok) {
			const body = await response.html
			this.element.outerHTML = body
			console.log("response!")
		}
	}

	visitLink(e){
		e.preventDefault()
		const url = e.currentTarget.dataset.actionUrl
		window.location = url
	}

	configurePath(){
		return `${this.element.dataset.path}/configure`
	}

	submitPath(){
		return `${this.element.dataset.path}/submit`
	}

	async sendData(e){
		console.log("SEND SUBMIT", e)
	}
}