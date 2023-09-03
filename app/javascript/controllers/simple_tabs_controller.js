import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  static targets = ['tab', 'panel'];

  connect() {
    this.showPanel(0); // Show the first tab content by default
  }

  changeTab(event) {
    event.preventDefault();
    const index = this.tabTargets.indexOf(event.currentTarget);
    this.showPanel(index);
  }

  showPanel(index) {
    this.tabTargets.forEach((tab, tabIndex) => {
      const selectedClasses = (tab.dataset.selectedClass || 'active').split(
        ' '
      );
      const unselectedClasses = (
        tab.dataset.unselectedClass || 'inactive'
      ).split(' ');

      if (tabIndex == index) {
        tab.classList.add(...selectedClasses);
        tab.classList.remove(...unselectedClasses);
        this.panelTargets[tabIndex].classList.remove('hidden');
      } else {
        tab.classList.remove(...selectedClasses);
        tab.classList.add(...unselectedClasses);
        this.panelTargets[tabIndex].classList.add('hidden');
      }
    });
  }
}
