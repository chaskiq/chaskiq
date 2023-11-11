import {
  disableBodyScroll,
  enableBodyScroll,
  clearAllBodyScrollLocks,
} from 'body-scroll-lock';

import { finder } from '@medv/finder';
class TourManager {
  constructor(props) {
    this.props = props;
    this.state = {
      cssPath: null,
      cssIs: null,
      run: false,
      selecting: true,
      selectedCoords: null,
      tourUrl: props.tourUrl,
      selectionMode: '',
      editElement: null,
      clickedElement: null, // To keep track of the element that's clicked
      isScrolling: false,
      steps: [],
    };

    console.log('TOUR MANAGER ENABLED!');

    this.componentDidMount();

    this.createAndInsertIframe(this.isCollapsed());

    this.tourGuide = null;

    this.createTourGuide();
  }

  pushEvent(data) {
    // console.log("ABOUT TO PUSH", data)
    switch (data.action) {
      case 'disablePreview':
        this.disablePreview();
        break;
      case 'enablePreview':
        this.enablePreview();
        break;

      case 'removeItem':
        this.removeItem();
        break;
      case 'enableEditMode':
        this.enableEditMode();
        break;
      case 'stopTour':
        this.tourGuide.destroy();
        break;
      case 'editStep':
        this.editStep(data);
        break;
      case 'addStep':
        this.currentUrl = data.url;
        this.enableSelectionMode();
        break;
      case 'saveTour':
        this.handleSaveTour();
        break;
      default:
        break;
    }
  }

  createTourGuide() {
    /*const options = {
      hidePrev: true, // hide prev button | default = false
      hideNext: true, // hide next button | default = false
      showStepDots: false, // show the dots tour progress | default = true
      showButtons: false, // show next/prev buttons | default = true
      showStepProgress: false, // show `1/5` human-readable step progress | default = true
      exitOnClickOutside: false // Close the tour on backdrop click | default = true
    }
    this.tourGuide = new window.tourguide.TourGuideClient(options)
    this.tourGuide.onAfterExit(()=>{
      console.info("The tour has closed")
      this.handleCancel()
    })*/

    //this.tourGuide = window.driver.js.driver;

    this.tourGuide = window.driver.js.driver();
  }

  // ... You can add other methods here

  setState(newState, callback = null) {
    // Simple setState method for this example
    this.state = { ...this.state, ...newState };

    if (callback) {
      callback();
    }

    // console.log(this.state)

    this.editorIframe.contentWindow.postMessage(
      {
        type: 'chaskiq:tour_manager_events',
        state: {
          cssPath: this.state.cssPath,
          run: this.state.run,
          selecting: this.state.selecting,
          selectedCoords: this.state.selectedCoords,
          selectionMode: this.state.selectionMode,
          isCollapsed: this.isCollapsed(),
        },
      },
      this.props.ev.origin
    );

    this.render();
  }

  sleep(delay) {
    var start = new Date().getTime();
    while (new Date().getTime() < start + delay);
  }

  handleMouseDown(e) {
    if (this.state.run) return;
    if (!this.state.selectionMode) return;
    if (!this.state.selecting) return;
    if (this.state.selectionMode === 'edit') return;

    e.stopPropagation();
    e.preventDefault();
    e.stopImmediatePropagation();

    e = e || window.event;
    const target = e.target || e.srcElement;

    const cssPath = finder(target); // Assuming 'finder' is available in the context
    const encodedCssPath = encodeURIComponent(cssPath);
    const url = `http://localhost:3000/apps/kLNE8uApck2uRH8phAGWpGNJ/campaigns/16/tour_step?target=${encodedCssPath}`;
    const path = {
      target: cssPath,
      content: `<div>
        ${this.getTemplate(url)}
      </div>`,
      //content: this.getTemplate(url),
      serialized_content: null,
    };

    if (this.state.steps.find((o) => o.target === path.target)) {
      console.log('no entró!!');
      return;
    }

    setTimeout(() => {
      this.setState(
        {
          steps: this.state.steps.concat(path),
          cssPath: cssPath,
          selecting: false,
          selectionMode: false,
          run: this.state.run,
        },
        () => {
          this.enableEditMode(path); // Assuming 'enableEditMode' is defined in this class
        }
      );
    }, 200);
  }

  handleMouseOver(e) {
    if (this.state.run) return;
    if (!this.state.selectionMode) return;
    if (!this.state.selecting) return;

    //if (this.state.selectionMode === 'edit')

    e = e || window.event;
    const target = e.target || e.srcElement;
    // console.log(target);
    this.getElementShape(target);
    this.setState({
      cssPath: finder(target),
    });
  }

  handleClick(e) {
    if (this.state.run) return;
    if (!this.state.selectionMode) return;
    if (!this.state.selecting) return;
    if (this.state.selectionMode === 'edit') return;

    e.stopPropagation();
    e.preventDefault();
    e.stopImmediatePropagation();
  }

  createAndInsertIframe(isCollapsed) {
    // Ensure there's only one iframe at a time with the specified ID
    const existingIframe = document.getElementById('customIframe');
    if (existingIframe) {
      document.body.removeChild(existingIframe);
      this.editorIframe = null;
    }

    // Create the iframe element
    this.editorIframe = document.createElement('iframe');
    this.editorIframe.id = 'customIframe';
    this.editorIframe.title = 'tour manager';
    this.editorIframe.style.zIndex = '100000000';
    this.editorIframe.src = `${this.state.tourUrl}/tour_editor`;
    this.editorIframe.style.position = 'fixed';
    this.editorIframe.style.bottom = '0px';
    this.editorIframe.style.border = 'none';
    this.editorIframe.style.width = '100%';
    this.editorIframe.style.left = '0px';
    this.editorIframe.style.height = isCollapsed ? '47px' : '206px';

    // Append the iframe to the body
    document.body.appendChild(this.editorIframe);
  }

  componentDidMount() {
    document.addEventListener(
      'mouseover',
      this.handleMouseOver.bind(this),
      false
    );

    document.addEventListener('click', this.handleClick.bind(this), false);

    document.addEventListener(
      'mousedown',
      this.handleMouseDown.bind(this),
      false
    );

    const scrollHandler = () => {
      if (!this.state.cssPath) return;
      if (!this.state.selectedCoords) return;
      // console.log('scrolleeen', this.state);
      const target = document.querySelector(this.state.cssPath);
      if (!target) return;
      this.getElementShape(target);
    };

    ///// document.addEventListener('scroll', isScrolling.bind(this));
    window.addEventListener('resize', scrollHandler.bind(this));
    document.addEventListener('scroll', scrollHandler.bind(this));

    window.addEventListener(
      'message',
      (e) => {
        if (e.data.type === 'steps_receive') {
          console.log('EVENTO TOUR!', e);
          this.setState({
            steps: e.data.tourManagerEnabled,
            ev: e,
          });
        }

        if (e.data.type === 'GET_TOUR') {
          console.log('GET_STEPS');
          this.setState({ steps: e.data.data.steps });
        }
      },
      false
    );

    this.getSteps();
  }

  componentWillUnmount() {}

  activatePreview() {
    this.setState({
      run: true,
      selectionMode: false,
      editElement: null,
      selecting: false,
    });
  }

  disablePreview() {
    this.setState({
      run: false,
    });
  }

  disableSelection() {
    this.setState({
      selecting: false,
    });
  }

  getElementShape(obj) {
    const coords = obj.getBoundingClientRect();
    // console.log(coords)
    this.setState({
      selectedCoords: {
        x: coords.x,
        y: coords.y,
        width: coords.width,
        height: coords.height,
        // width: coords.right - coords.left,
        // height: coords.bottom - coords.top,
      },
    });
  }

  removeItem(item) {
    this.setState(
      {
        steps: this.state.steps.filter((o) => o.target != item.target),
        selectionMode: false,
        editElement: null,
      },
      () => {
        this.disableSelection();
      }
    );
  }

  enableSelection() {
    this.setState({
      selecting: true,
    });
  }

  enableSelectionMode() {
    this.setState(
      {
        selectionMode: true,
      },
      () => setTimeout(() => this.enableSelection(), 500)
    );
  }

  saveContent(value, element) {
    const newSteps = this.state.steps.map((o) => {
      if (o.target === element.target) {
        o.serialized_content = JSON.stringify(value.serialized);
        o.html = value.html;
        return o;
      } else {
        return o;
      }
    });

    this.setState({
      steps: newSteps,
    });
  }

  handleDirectUpload(file, imageBlock, input) {
    window.addEventListener(
      'message',
      (e) => {
        if (e.data.type === 'UPLOAD_COMPLETED') {
          imageBlock.updateAttributes({
            url: e.data.data.serviceUrl,
          });
        }
      },
      false
    );

    this.props.ev.source.postMessage(
      {
        type: 'UPLOAD_IMAGE',
        file: file,
        // imageBlock: imageBlock,
        input: input,
      },
      this.props.ev.origin
    );
  }

  handleUrlUpload(file, imageBlock, input) {
    window.addEventListener(
      'message',
      (e) => {
        if (e.data.type === 'URL_UPLOAD_COMPLETED') {
          imageBlock.uploadCompleted(e.data.data.serviceUrl);
        }
      },
      false
    );

    this.props.ev.source.postMessage(
      {
        type: 'URL_UPLOAD',
        file: file,
        // imageBlock: imageBlock,
        input: input,
      },
      this.props.ev.origin
    );
  }

  getTemplate(url) {
    return `
      <div class="border-red">
        <div>
          <iframe src="${url}" 
            width="100%" 
            height="100%" 
            style="border:none">
          </iframe>
        </div>
      </div>
    `;
  }

  enableEditMode(editElement) {
    const newEl = {
      title: 'oli',
      //target: editElement.target,
      selector: editElement.target,
      //disableBeacon: true,
      content: `<p class="mb-3">Looks like you're ready to go 🎉</p><p class="mb-3 text-xs opacity-50">Click anywhere to exit the tour.</p><img src="https://media2.giphy.com/media/axu6dFuca4HKM/giphy.gif?cid=790b76116cda53c45dac6381787fa420167338528a9a9abb&rid=giphy.gif&ct=g" width="280"/>`,
      /*
      save: this.handleSaveTour,
      close: this.handleCancel,
      serialized_content: editElement.serialized_content,
      */
    };
    this.setState(
      {
        selectionMode: 'edit',
        editElement: newEl,
        cssPath: editElement.target,
        styles: {
          options: {
            zIndex: 10000,
            padding: '5px',
          },
        },
      },
      () =>
        setTimeout(() => {
          //this.addSteps(this.state.steps)
          //this.startTour()
          const url = `${this.currentUrl}?target=${encodeURIComponent(
            editElement.target
          )}`;
          const path = {
            element: editElement.target,
            popover: {
              title: '',
              description: `<div>
              ${this.getTemplate(url)}
            </div>`,
            },
            //content: this.getTemplate(url),
            serialized_content: null,
          };

          this.tourGuide = window.driver.js.driver({
            showButtons: ['close'],
            showProgress: false,
            steps: [path],
            onDestroyed: (e) => {
              console.info('The tour has closed');
              this.handleCancel();
            },
          });

          this.tourGuide.drive();
          // this.enableSelection()
        }, 500)
    );
  }

  editStep(step) {
    const newEl = null;
    this.setState(
      {
        selectionMode: 'edit',
        editElement: newEl,
        cssPath: step.target,
        styles: {
          options: {
            zIndex: 10000,
            padding: '5px',
          },
        },
      },
      () =>
        setTimeout(() => {
          const encodedCssPath = encodeURIComponent(step.target);
          const url = `${step.url}&target=${encodedCssPath}`;
          const path = {
            element: step.target,
            popover: {
              title: '',
              description: `<div>
            ${this.getTemplate(url)}
          </div>`,
            },
            //content: this.getTemplate(url),
            serialized_content: null,
          };

          //this.createTourGuide()

          this.tourGuide = window.driver.js.driver({
            showButtons: ['close'],
            showProgress: false,
            steps: [path],
            onDestroyed: (e) => {
              this.handleCancel();
            },
          });

          this.tourGuide.drive();

          /*this.tourGuide.tourSteps = []
          this.tourGuide.deleteFinishedTour()
          this.tourGuide.addSteps([path])
          debugger
          this.tourGuide.tourSteps[0] = path
          this.tourGuide.activeStep[0]
          this.startTour()*/
          // this.enableSelection()
        }, 500)
    );
  }

  addStep(data) {
    debugger;
    //this.enableSelectionMode()
  }

  disableEditMode() {
    this.setState({
      selecting: false,
      selectionMode: false,
    });
  }

  updateChanges() {
    this.setState(
      {
        selecting: false,
        selectionMode: false,
      },
      () => {
        const newSteps = this.state.steps.map((o) => {
          if (o.target === this.state.editElement.target) {
            // this.state.editElement
            return o;
          } else {
            return o;
          }
        });
        this.setState({ steps: newSteps });
      }
    );
  }

  prepareJoyRidyContent() {
    return (
      this.state.steps &&
      this.state.steps.map((o, index) => {
        o.disableBeacon = index === 0;
        o.selector = o.target;
        /*o.content = (
          <EditorStylesForTour campaign={true}>
            {o.serialized_content && (
              <Renderer
                domain={this.props.domain}
                raw={JSON.parse(o.serialized_content)}
              />
            )}
          </EditorStylesForTour>
        );*/
        return o;
      })
    );
  }

  handleSaveTour() {
    this.props.ev.source.postMessage(
      {
        type: 'SAVE_TOUR',
        steps: this.state.steps.map((o) => {
          return {
            target: o.target,
            serialized_content: o.serialized_content,
          };
        }),
      },
      this.props.ev.origin
    );

    this.setState(
      {
        selecting: false,
        selectionMode: false,
        selectedCoords: null,
      },
      clearAllBodyScrollLocks
    );
  }

  handleCancel() {
    this.setState({
      selecting: false,
      selectionMode: false,
      selectedCoords: null,
    });
  }

  getSteps() {
    /*
    this.props.ev.source.postMessage(
      { type: 'GET_TOUR' },
      this.props.ev.origin
    );*/
  }

  handleMouseOut() {
    this.enableSelection();
  }

  isCollapsed() {
    return this.state.selectionMode || this.state.run;
  }

  disableBody(target) {
    // console.log('disable body', target);
    disableBodyScroll(target);
    //... same content ...
  }

  enableBody(target) {
    // console.log('enable body', target);
    enableBodyScroll(target);
  }

  render() {
    this.renderSelectionOverlay(this.state);
    this.editorIframe.style.height = this.isCollapsed() ? '47px' : '206px';
  }

  renderSelectionOverlay(state) {
    // Ensure there's only one overlay at a time
    const existingOverlay = document.getElementById('selectionOverlay');
    if (existingOverlay) {
      document.body.removeChild(existingOverlay);
    }

    if (state.selectedCoords && !state.run) {
      // Create the overlay div
      const overlayDiv = document.createElement('div');
      overlayDiv.id = 'selectionOverlay';
      overlayDiv.style.border = '2px solid green';
      overlayDiv.style.position = 'fixed';
      overlayDiv.style.zIndex = 999;
      overlayDiv.style.pointerEvents = 'none';
      overlayDiv.style.boxShadow =
        state.selectionMode !== 'edit'
          ? '0px 0px 0px 4000px rgba(0, 0, 0, 0.15)'
          : 'none';
      overlayDiv.style.top = state.selectedCoords.y + 'px';
      overlayDiv.style.left = state.selectedCoords.x + 'px';
      overlayDiv.style.width = state.selectedCoords.width + 'px';
      overlayDiv.style.height = state.selectedCoords.height + 'px';

      // Append the overlay to the body
      document.body.appendChild(overlayDiv);
    }
  }
}

export default TourManager;
