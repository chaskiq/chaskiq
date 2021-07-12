import { Controller } from 'stimulus'

export default class extends Controller {
  connect() {
		
  }

	handleChange(e){
		console.log("CHANGE CHANCNEWNE", e)

		this.element.requestSubmit()
	}

}