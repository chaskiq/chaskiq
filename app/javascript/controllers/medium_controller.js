import mediumZoom from 'medium-zoom'

import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
 
  connect() {
    mediumZoom(document.querySelectorAll(".medium-zoom-image"))
  }

}