import { Controller } from '@hotwired/stimulus';
import { get } from '@rails/request.js';

export default class extends Controller {
  static targets = ['entries', 'pagination', 'loader'];

  initialize() {
    let options = {
      rootMargin: this.element.dataset.rootMargin || '20px',
    };

    this.scrollsElement = this.element.dataset.scrollsElement;

    this.intersectionObserver = new IntersectionObserver(
      (entries) => this.processIntersectionEntries(entries),
      options
    );
  }

  connect() {
    this.intersectionObserver.observe(this.paginationTarget);
  }

  disconnect() {
    this.intersectionObserver.unobserve(this.paginationTarget);
  }

  processIntersectionEntries(entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        this.loadMore();
      }
    });
  }

  hideLoader() {
    if (!this.hasLoaderTarget) return;
    this.loaderTarget.classList.add('hidden');
  }

  showLoader() {
    if (!this.hasLoaderTarget) return;
    this.loaderTarget.classList.remove('hidden');
  }

  visitPage(url) {
    this.showLoader();

    get(url, { responseKind: 'turbo' })
      .then((response) => {
        if (response.ok) {
          this.hideLoader();

          if (!this.scrollsElement) return;

          setTimeout(
            () => document.getElementById(this.scrollsElement).scrollBy(0, 220),
            40
          );

          return;
        }

        throw new Error('Network response was not ok');
      })
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        this.hideLoader();
        console.error('There was a problem with the fetch operation:', error);
      });
  }

  loadMore() {
    let next_page = this.paginationTarget.querySelector("a[rel='next']");
    if (next_page == null) {
      return;
    }
    let url = next_page.href;

    console.log('NEXT PAGE:', next_page);

    // next_page.click();
    this.visitPage(url);

    /*Rails.ajax({
      type: 'GET',
      url: url,
      dataType: 'json',
      success: (data) => {
        this.entriesTarget.insertAdjacentHTML('beforeend', data.entries)
        this.paginationTarget.innerHTML = data.pagination
      }
    })*/
  }
}
