import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  connect() {
    console.log('TOUR EDITOR CLIENT LOADED!');
  }

  initialize() {
    this.state = {
      enabledTour: false,
    };

    this.props = {
      data: {},
    };

    window.TourManagerEnabled = () => {
      return this.state.enabledTour; // alert("oaoaoaoa")
    };

    window.TourManagerMethods = {
      update: this.updateData,
      getSteps: () => this.props.data.steps,
    };

    // events received from child window & pingback
    this.tour_events = this.handleMessage.bind(this);

    window.addEventListener('message', this.tour_events, false);
  }

  handleMessage(e) {
    console.log('RECEIVED ACTION ON TOUR CLIENT', e);
    if (e.data.type === 'ENABLE_MANAGER_TOUR') {
      window.__CHILD_WINDOW_HANDLE_2.postMessage(
        {
          tour: JSON.parse(this.element.dataset.campaign),
          tourUrl: this.element.dataset.url,
          tourManagerEnabled: true,
        },
        '*'
      );
    }

    if (e.data.type === 'GET_TOUR') {
      window.__CHILD_WINDOW_HANDLE_2.postMessage(
        {
          type: 'GET_TOUR',
          data: this.props.data,
        },
        '*'
      );
    }

    if (e.data.type === 'SAVE_TOUR') {
      this.updateData(e.data.steps, () => {
        window.__CHILD_WINDOW_HANDLE_2.postMessage(
          {
            type: 'GET_TOUR',
            data: this.props.data,
          },
          '*'
        );
      });
    }

    if (e.data.type === 'UPLOAD_IMAGE') {
      this.handleDirectUpload(e.data.file, e.data.input);
    }

    if (e.data.type === 'URL_IMAGE') {
      this.handleUrlUpload(e.data.file);
    }
  }

  updateData = (data, cb) => {
    /*const params = {
      appKey: this.props.app.key,
      id: this.props.data.id,
      campaignParams: {
        steps: data,
      },
    };

    graphql(UPDATE_CAMPAIGN, params, {
      success: (data) => {
        this.props.updateData(data.campaignUpdate.campaign, null);
        if (cb) cb();
        // this.setState({ status: "saved" })
      },
      error: () => {},
    });*/
  };

  handleUrlUpload(url) {
    /*graphql(
      CREATE_URL_UPLOAD,
      { url: url },
      {
        success: (data) => {
          const { signedBlobId, headers, url, serviceUrl } =
            data.createUrlUpload.directUpload;
          // imageBlock.uploadCompleted(serviceUrl)
          // this.props.uploadHandler({signedBlobId, headers, url, serviceUrl, imageBlock})
          // this.setDisabled(false)
          window.__CHILD_WINDOW_HANDLE_2.postMessage(
            {
              type: 'URL_UPLOAD_COMPLETED',
              data: { signedBlobId, headers, url, serviceUrl },
            },
            '*'
          );
        },
        error: () => {},
      }
    );*/
  }

  handleDirectUpload(file, input) {
    graphql(CREATE_DIRECT_UPLOAD, input, {
      success: (data) => {
        const { signedBlobId, headers, url, serviceUrl } =
          data.createDirectUpload.directUpload;
        console.log('DRECT', signedBlobId, headers, url, serviceUrl);
        directUpload(url, JSON.parse(headers), file).then(() => {
          window.__CHILD_WINDOW_HANDLE_2.postMessage(
            {
              type: 'UPLOAD_COMPLETED',
              data: { signedBlobId, headers, url, serviceUrl },
            },
            '*'
          );

          // this.setDisabled(false)
          // imageBlock.uploadCompleted(serviceUrl)
          // this.props.uploadHandler({signedBlobId, headers, url, serviceUrl, imageBlock})
        });
      },
      error: (error) => {
        //this.setDisabled(false);
        console.log('error on signing blob', error);
      },
    });
  }

  enableEditor(e) {
    e.preventDefault();
    this.openTourManager();
  }

  openTourManager() {
    const campaign = JSON.parse(this.element.dataset.campaign);
    //this.setState(
    //  {
    //    enabledTour: true,
    //  },
    //  () => {
    console.log(campaign);
    const options =
      'directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no,width=700,height=500,left=200,top=100';
    window.__CHILD_WINDOW_HANDLE_2 = window.open(
      `${campaign.settings.url}`,
      'win',
      options
    );
    //}
    //);
  }

  disconnect() {
    window.TourManagerEnabled = null;
    window.TourManagerMethods = null;
    window.removeEventListener('message', this.tour_events);
    window.__CHILD_WINDOW_HANDLE_2 && window.__CHILD_WINDOW_HANDLE_2.close();
  }
}
