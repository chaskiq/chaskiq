// Load all the controllers within this directory and all subdirectories.
// Controller files must be named *_controller.js or *_controller.ts.

import { Application } from '@hotwired/stimulus';

/*import { definitionsFromContext } from 'stimulus/webpack-helpers';

const application = Application.start();
const context = require.context('controllers', true, /_controller\.(js|ts)$/);
application.load(definitionsFromContext(context));
*/

const application = Application.start();
import controllers from './**/*_controller.js';
controllers.forEach((controller) => {
  application.register(controller.name, controller.module.default);
});
