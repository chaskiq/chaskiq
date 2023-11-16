import { Turbo } from '@hotwired/turbo-rails';
window.Turbo = Turbo;

import 'rc-tooltip/assets/bootstrap.css';
import './controllers';
import '../frontend/components/index';


/*
// hack on preserve scroll https://github.com/hotwired/turbo/issues/37#issuecomment-1581864979
if (!window.scrollPositions) {
  window.scrollPositions = {};
}

function preserveScroll () {
  document.querySelectorAll("[data-preserve-scroll").forEach((element) => {
    window.scrollPositions[element.id] = element.scrollTop;
  })
}

function restoreScroll (event) {
  document.querySelectorAll("[data-preserve-scroll").forEach((element) => {
    element.scrollTop = window.scrollPositions[element.id];
  }) 

  if (!event.detail.newBody) return
  // event.detail.newBody is the body element to be swapped in.
  // https://turbo.hotwired.dev/reference/events
  event.detail.newBody.querySelectorAll("[data-preserve-scroll").forEach((element) => {
    element.scrollTop = window.scrollPositions[element.id];
  })
}

window.addEventListener("turbo:before-cache", preserveScroll)
window.addEventListener("turbo:before-render", restoreScroll)
window.addEventListener("turbo:render", restoreScroll)
*/
