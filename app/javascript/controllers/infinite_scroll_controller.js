import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  static targets = ['entries', 'pagination'];

  initialize() {
    let options = {
      rootMargin: '20px',
    };

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
    console.log('ENTRIES', entries);
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        this.loadMore();
      }
    });
  }

  loadMore() {
    let next_page = this.paginationTarget.querySelector("a[rel='next']");
    if (next_page == null) {
      return;
    }
    let url = next_page.href;

    console.log('NEXT PAGE:', next_page);

    next_page.click();

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
