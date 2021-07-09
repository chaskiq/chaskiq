import "./index.css"
import Prism from 'prismjs'

// Add a Stimulus controller for this component.
// It will automatically registered and its name will be available
// via #component_name in the component class.
//
 import { Controller as BaseController } from "stimulus";
//
 export class Controller extends BaseController {
   connect() {
			this.element.innerHTML = this.colorizeCode()
   }

   disconnect() {
   }

	 colorizeCode(){
		return Prism.highlight(this.element.innerHTML, Prism.languages.ruby, 'ruby')
	 }
 }
