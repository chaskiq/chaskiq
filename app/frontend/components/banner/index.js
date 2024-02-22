import './index.scss'

// Add a Stimulus controller for this component.
// It will automatically registered and its name will be available
// via #component_name in the component class.
//

import { Controller as BaseController } from "@hotwired/stimulus";

export default class Controller extends BaseController {

  closeBanner(e){
    e.preventDefault()
    const message = {
      type: "banner:close"
    }
    this.postMessage(message, '*');
  }

  clickBanner(e){
    e.preventDefault()
    const message = {
      type: "banner:click",
      url: e.currentTarget.dataset.url
    }
    this.postMessage(message, '*');
  }

  postMessage(data){
    const message = {
      type: 'chaskiq:event',
      data: data,
    };
    console.log("PUSHING TO PARENT", message)
    window.parent.postMessage(message, '*');
  }
}