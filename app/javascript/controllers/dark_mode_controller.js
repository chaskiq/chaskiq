import { Controller } from 'stimulus';

export default class extends Controller {
  connect() {
    this.element.classList.add(this.getParsedTheme().theme);
  }

  toggle(e) {
    e.preventDefault();
    this.element.classList.remove('light');
    this.element.classList.remove('dark');
    var theme = this.getParsedTheme().theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('THEME', JSON.stringify({ theme: theme }));
    this.element.classList.add(theme);
  }

  getParsedTheme() {
    var theme = localStorage.getItem('THEME');
    return theme ? JSON.parse(theme) : { theme: 'light' };
  }
}
