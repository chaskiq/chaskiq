import { Controller } from '@hotwired/stimulus';
import Sortable from 'sortablejs';
import { post } from '@rails/request.js';

//import axios from 'axios'

export default class extends Controller {
  connect() {
    console.log('sortable!');

    let group = null;
    if (this.element.dataset.group) {
      group = {
        name: 'shared',
        //pull: 'clone' // To clone: set pull to 'clone'
      };
    }

    this.sortable = Sortable.create(this.element, {
      onEnd: this.end.bind(this),
      group: group,
      ghostClass: this.element.dataset.ghost,
      handle: this.element.dataset.handle,
      connectWith: ['.item-list'],
      animation: 150,
    });
  }

  async sendData(data, cb) {
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
    const itemUrl = e.item.dataset.url;
    let parentSectionId = null;

    //if(e.item.dataset.lookFor){
    //	parentSectionId = e.item.parents(e.item.dataset.lookFor).dataset.id
    //}

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

    /*
		axios({
			method: 'patch',
			url: itemUrl,
			headers: {
				'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
			},
			data: { section: {
				id: item,
				parent_section_id: parentSectionId,
				position: e.newIndex + 1
			} },
			onUploadProgress: e => {
				console.log(e)
				//return this.updateProgressBar(e)
			}
		}).then(result => {
			console.log("good!")
			//this.setState({collection: result.data.collection})
			//console.log(result.data.map((o)=> o.id))
		}).catch(error => {
			debugger
			//console.log(`ERROR: got error uploading file ${ error }`)
		})
		*/
    console.log('end!');
  }
}
