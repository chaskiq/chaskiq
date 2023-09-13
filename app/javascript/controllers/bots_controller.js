import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  static targets = [
    'pathLink',
    'pathContainer',
    'followActionlinks',
    'followActionsLinksActions',
    'currentPathField'
  ];

  initialize() {
    console.log('BOT EDITORRR');
    this.selectedClass = 'bg-green-500';
  }

  initializePargets() {
    this.pathContainerTargets.forEach((c) => {
      c.classList.add('hidden');
    });

    this.pathContainerTargets[0].classList.remove('hidden');
  }

  pathClick(e) {
    e.preventDefault();

    // Remove 'selectedClass' from all pathLinkTargets
    this.pathLinkTargets.forEach((link) => {
      link.classList.remove(this.selectedClass);
    });

    this.pathContainerTargets.forEach((c) => {
      c.classList.add('hidden');
    });

    const id = e.currentTarget.dataset.pathId;

    const selectedPathElement = this.element.querySelector(
      `#bot-path-container-${id}`
    );

    selectedPathElement.classList.remove('hidden');
    // Add 'selectedClass' to the clicked link
    e.currentTarget.classList.add(this.selectedClass);

    this.currentPathFieldTarget.value = id

    console.log('ieek', this.pathLinkTargets);
  }

  resetFollowActions(e) {
    debugger;
  }

  hideFollowActionLinks() {
    this.followActionlinksTarget.classList.add('hidden');
  }

  showFollowActionLinks() {
    this.followActionlinksTarget.classList.remove('hidden');
  }

  removeBotStep(e) {
    const botStep = e.currentTarget.dataset.botStep;
    document.getElementById(botStep).remove();
    this.showFollowActionLinks();
  }

  togglefollowActionsLinksActions() {
    this.followActionlinksTarget.classList.toggle('hidden');
  }
}
