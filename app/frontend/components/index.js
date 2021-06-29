// IMPORTANT: Update this import to reflect the location of your Stimulus application
// See https://github.com/palkan/view_component-contrib#using-with-stimulusjs
//import { application } from "../init/stimulus";

import { Application } from 'stimulus'
export const application = Application.start()

const context = require.context('.', true, /index.js$/)
context.keys().forEach((path) => {
  const mod = context(path)

  // Check whether a module has the Controller export defined
  if (!mod.Controller) return

  // Convert path into a controller identifier:
  //   example/index.js -> example
  //   nav/user_info/index.js -> nav--user-info
  const identifier = path
    .replace(/^\.\//, '')
    .replace(/\/index\.js$/, '')
    .replace(/\//, '--')

  application.register(identifier, mod.Controller)
})
