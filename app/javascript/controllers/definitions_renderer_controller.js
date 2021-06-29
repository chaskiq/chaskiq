import { Controller } from 'stimulus'

export default class extends Controller {
  connect() {
    console.log('DEFINITIONSSSSNNSNS')
  }

  dispatchAction(e) {
    console.log('DISPATCHED ', e)
  }
}
