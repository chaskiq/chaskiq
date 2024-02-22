import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  static targets = [
    'pathLink',
    'pathContainer',
    'followActionlinks',
    'followActionsLinksActions',
    'currentPathField',
  ];

  initialize() {
    console.log('BOT EDITORRR');
    this.selectedClass = 'bg-green-200';
    this.updatePositions();

    document.addEventListener('sortable:end', (event) => {
      this.updatePositions();
    });
  }

  updatePositions() {
    this.pathContainerTargets.forEach((container) => {
      this.updatePositionForPathContainer(container);
    });
  }

  updatePositionForPathContainer(container) {
    const positionFields = container.querySelectorAll('.position');

    positionFields.forEach((field, index) => {
      field.value = index + 1; // Because we want it to start from 1, not 0
    });
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

    this.currentPathFieldTarget.value = id;

    console.log('ieek', this.pathLinkTargets);
  }

  hideFollowActionLinks() {
    debugger;
    this.followActionlinksTarget.classList.add('hidden');
  }

  showFollowActionLinks() {
    this.followActionlinksTarget.classList.remove('hidden');
  }

  deletePath(e) {
    const pathId = e.currentTarget.dataset.path;
    const botPathId = `bot-path-container-${pathId}`;
    const botPathLinkId = `path-link-${pathId}`;

    document.getElementById(botPathId).remove();
    document.getElementById(botPathLinkId).remove();

    const container = this.pathContainerTargets[0];
    if (container) {
      container.classList.toggle('hidden');
      this.pathLinkTargets[0].classList.toggle(this.selectedClass);
    }
  }

  removeBotStep(e) {
    const botStep = e.currentTarget.dataset.botStep;
    document.getElementById(botStep).remove();
    this.showFollowActionLinks();
  }

  hideThis(e) {
    e.currentTarget.classList.add('!hidden');
  }

  handleFollowActionOption(e) {
    const nestedFieldWrapper = e.currentTarget.closest(
      '.follow-actions-wrapper'
    );

    if (nestedFieldWrapper) {
      nestedFieldWrapper
        .querySelector('.followActionlinks')
        .classList.add('hidden');
      const nestedField = nestedFieldWrapper.querySelector(
        '.followActionLinksWrapper'
      );
      if (nestedField) {
        nestedField.classList.remove('hidden');
        e.stopImmediatePropagation();
      }
    }
  }

  displayFollowActionOption(e) {
    const nestedFieldWrapper = e.currentTarget.closest(
      '.follow-actions-wrapper'
    );
    const btn = nestedFieldWrapper.querySelector(
      e.currentTarget.dataset.display
    );
    btn.classList.remove('!hidden');
  }

  remove_association(e) {
    console.log(e);
    const nestedFieldWrapper = e.currentTarget.closest(
      '.follow-actions-wrapper'
    );
    this.displayFollowActionOption(e);
    e.currentTarget.closest('.nested-fields').remove();

    const nestedFields = nestedFieldWrapper.querySelectorAll(
      '.follow-action-item'
    );
    if (nestedFields.length == 0) {
      this.showFollowActionLinks();
      nestedFieldWrapper.querySelector('.followActionLinksWrapper').remove();
    }

    //.querySelectorAll(".nested-fields")
    console.log(nestedFields);
  }

  togglefollowActionsLinksActions() {
    this.followActionlinksTarget.classList.toggle('hidden');
  }
}
