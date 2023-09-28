
import { Controller } from '@hotwired/stimulus';
import { post } from '@rails/request.js'

const normalize = (val, max, min) => {
  return (val - min) / (max - min);
};

const percentage = (partialValue, totalValue) => {
  return (100 * partialValue) / totalValue;
};

export default class extends Controller {

  static targets = ["header", "chatField", "uploadField", "conversationScrollArea"]
  static values = ["url"]

  connect() {
    console.log("MESSENGER INITIALIZED")
  }

  submitMessage(){
    debugger
  }

  convertToSerializedContent(value){
    return {
      text: value
    }
  }

  async insertComment(url, data) {
    const response = await post(url, {
      body: data,
      responseKind: 'turbo-stream'
    })

    this.chatFieldTarget.value = ""

    if (response.ok) {
      //const body = await response.html
      //this.element.closest('.definition-renderer').outerHTML = body
      console.log('response!')
    }
  }

  handleEnter(e){
    console.log("HANDLE ENTER")

    e.preventDefault();

    if (this.chatFieldTarget.value === '') return;

    const opts = {
      content: this.chatFieldTarget.value,
      //...this.convertToSerializedContent(this.chatFieldTarget.value),
    };

    console.log(this.chatFieldTarget.dataset.url, opts)
    
    this.insertComment(this.chatFieldTarget.dataset.url, opts)

    /*
    this.props.insertComment(opts, {
      before: () => {
        this.props.beforeSubmit && this.props.beforeSubmit(opts);
        this.chatFieldTarget.value = '';
      },
      sent: () => {
        this.props.onSent && this.props.onSent(opts);
        this.chatFieldTarget.value = '';
      },
    });*/
  }

  handleChatInput(e){
    console.log("HANDLE typing")
    console.log(e.type)
  }

  setHeaderStyles(element, styles){
    for (let [property, value] of Object.entries(styles)) {
      if (property === 'translateY') {
          // Handle transform properties separately
          element.style.transform = `translateY(${value})`;
      } else {
          element.style[property] = value;
      }
    }
  }

  handleScroll(e){
    if(this.hasHeaderTarget){
      const target = e.target;
      const opacity =
        1 - normalize(target.scrollTop, target.offsetHeight * 0.26, 0);
      const pge = percentage(target.scrollTop, target.offsetHeight * 0.7);
      // console.log("AAAA", val)
      const options = {
        translateY: -pge - 8,
        opacity: opacity,
        height: this.headerTarget.offsetHeight,
      }
      this.setHeaderStyles(this.headerTarget, options)
    }
  }

  handleFileUpload(e){
    console.log("CLICK", e)
    // Trigger the hidden file input
    this.uploadFieldTarget.click();
  }


  handleFileUploadChange(e){
    console.log(e)
    const file = e.target.files[0];
    if (file) {
      // Handle the file, e.g., send to server or process locally
      console.log("Selected file:", file.name);
    }
  }
}
