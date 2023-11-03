import "./index.css"
import {Controller} from '@hotwired/stimulus'
import { put } from "@rails/request.js";

// Add a Stimulus controller for this component.
// It will automatically registered and its name will be available
// via #component_name in the component class.
//
// import { Controller as BaseController } from "stimulus";
//
export default class extends Controller {
  connect() {
  }

  disconnect() {
  }

  sendPutRequest(event) {
    put(event.currentTarget.dataset.url, {responseKind: "turbo"})
      .then(response => {
        if (response.ok) {
          return response.text();
        }
        throw new Error("Network response was not ok");
      })
      .then(data => {
        console.log(data);
      })
      .catch(error => {
        console.error("There was a problem with the fetch operation:", error);
      });
  }
 }
