import * as Turbo from '@hotwired/turbo'
import { Controller } from 'stimulus'
import { useMutation } from 'stimulus-use'

//import { useMutation } from 'stimulus-use';

export default class extends Controller {
  static targets = ['contentframe']

  connect() {
    useMutation(this, {
      element: this.contentframeTarget,
      //attributes: true,
      attributeFilter: ['busy'],
    })

    /*document.addEventListener("turbo:load", function() {
			console.log("aaaaa")
			this.listenLinks()
		})*/
  }

  mutate(entries) {
    console.log('mutate mier')
    for (const mutation of entries) {
      if (mutation.type === 'childList') {
        console.log('A child node has been added or removed.')
      } else if (mutation.target === this.element) {
        console.log('The root element of this controller was modified.')
      } else if (mutation.type === 'attributes') {
        this.listenLinks()
        console.log(
          'The ' + mutation.attributeName + ' attribute was modified.'
        )
      }
    }
  }

  listenLinks() {
    Array.from(document.getElementsByTagName('a')).forEach((el) => {
      // Do stuff here
      console.log('oip opi', el)
      el.addEventListener(
        'click',
        (e) => {
          console.log('sksksk')
          Turbo.navigator.history.push(new URL(e.currentTarget.href))
        },
        false
      )
    })
  }
}
