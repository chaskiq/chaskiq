import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  static targets = ['container', 'form'];

  connect() {}

  open(e) {
    const email = this.element.dataset.email;
    const appKey = this.element.dataset.appKey;
    const productId = e.currentTarget.dataset.productId;

    Paddle.Setup({
      vendor: this.element.dataset.vendorId, // Replace with your Vendor ID.
    });

    Paddle.Checkout.open({
      method: 'inline',
      email: email,
      product: productId, // Replace with your Product or Plan ID
      allowQuantity: false,
      disableLogout: true,
      passthrough: appKey,
      frameTarget: 'paddle-content-wrapper', // The className of your checkout <div>
      frameInitialHeight: 366,
      frameStyle: 'width:100%; background-color: transparent; border: none;',
      successCallback: (_info) => {
        //handleSuccess()
        this.modalController().close();
      },
    });
  }

  get modalController() {
    return this.application.getControllerForElementAndIdentifier(
      document.querySelector('#main-page'),
      'modal'
    );
  }
}
