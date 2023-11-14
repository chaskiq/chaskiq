import { Controller } from '@hotwired/stimulus';
import Sortable from 'sortablejs';
import { post } from '@rails/request.js';

//import axios from 'axios'

export default class extends Controller {
  static targets = ['item'];

  initialize() {
    console.log('sortable!');

    let group = null;
    if (this.element.dataset.group) {
      group = {
        name: 'shared',
        //pull: 'clone' // To clone: set pull to 'clone'
      };
    }

    this.refresh();

    this.sortable = Sortable.create(this.element, {
      onEnd: this.end.bind(this),
      group: group,
      ghostClass: this.element.dataset.ghost,
      handle: this.element.dataset.handle,
      connectWith: ['.item-list'],
      animation: 150,
    });

    document.addEventListener('sortable:refresh', (event) => {
      this.refresh();
    });
  }

  async sendData(data, cb) {
    if (!this.element.dataset.url) return;
    const response = await post(this.element.dataset.url, {
      body: JSON.stringify(data),
      responseKind: 'turbo-stream',
    });
    if (response.ok) {
      cb && cb();
    }
  }

  end(e) {
    console.log('DRAGABBLE END', e);

    const item = e.item.dataset.id;
    // const itemUrl = e.item.dataset.url;
    let parentSectionId = null;

    //if(e.item.dataset.lookFor){
    //	parentSectionId = e.item.parents(e.item.dataset.lookFor).dataset.id
    //}

    const event = new CustomEvent('sortable:end', { detail: 'eventData' });
    document.dispatchEvent(event);

    this.sendData(
      {
        section: {
          id: item,
          group_from: e.from.dataset.group,
          group_to: e.to.dataset.group,
          parent_section_id: parentSectionId,
          position: e.newIndex,
        },
      },
      () => {
        console.log('YEYE!');
      }
    );

    console.log('end!');
  }

  refresh() {
    if (!this.hasItemTargets) return;
    this.itemTargets.forEach((item, index) => {
      const positionInput = item.querySelector('.position');
      if (positionInput) {
        positionInput.value = index + 1; // The position is 1-indexed
      }
    });
  }
}
