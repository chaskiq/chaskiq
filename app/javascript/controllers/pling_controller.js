import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  initialize() {
    const dataset = this.element.dataset;
    // console.log(new Date().toUTCString());
    // console.log("Listening for notifications", this.element.dataset)
    this.pling = new Audio('/sounds/BLIB.wav');
    this.playSound();
  }

  playSound() {
    this.pling.volume = 0.4;
    this.pling.play();
  }
}
