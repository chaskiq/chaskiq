import { Controller } from 'stimulus'

export default class extends Controller {
  //static targets = ['contentframe'];

  connect() {
    console.log('CONVERSAIOTN')
  }

  toggleSidebar() {
    console.log('TOGGLE!!!!')

    const sidebar = document.getElementById('conversation-sidebar')
    sidebar.classList.toggle('hidden')
    sidebar.classList.toggle('sm:block')
  }
}
