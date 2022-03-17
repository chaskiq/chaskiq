import './index.css'

import { Controller as BaseController } from '@hotwired/stimulus'

export default class Controller extends BaseController {
  connect() {
    setTimeout(() => this.element.remove(), 5000)
  }

  disconnect() {}

  close() {
    this.element.classList.add(
      'transform',
      'opacity-0',
      'transition',
      'duration-1000'
    )
    setTimeout(() => this.element.remove(), 1000)
  }
}
