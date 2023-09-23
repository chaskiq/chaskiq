import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  connect() {
    this.element.classList.add(getTheme());
  }

  toggle(e) {
    e.preventDefault();
    this.element.classList.remove('light');
    this.element.classList.remove('dark');
    const newTheme = getTheme() === 'light' ? 'dark' : 'light';
    this.setCookie('darkmode', newTheme, 30); // Store for 30 days
    this.element.classList.add(newTheme);

    // Dispatch custom event with new theme value
    const themeChangedEvent = new CustomEvent('themeChanged', {
      detail: { theme: newTheme },
    });
    window.dispatchEvent(themeChangedEvent);
  }

  setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    const expires = 'expires=' + d.toUTCString();
    document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
  }
}

export function getCookie(cname) {
  const name = cname + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}

export function getTheme() {
  const themeCookie = getCookie('darkmode');
  return themeCookie ? themeCookie : 'light';
}
