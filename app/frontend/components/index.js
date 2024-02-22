// IMPORTANT: Update this import to reflect the location of your Stimulus application
// See https://github.com/palkan/view_component-contrib#using-with-stimulusjs
import application from "../../javascript/controllers/init";

window.application = application
//import { Application } from '@hotwired/stimulus'
//export const application = Application.start()
/*
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
*/

import controllers from "./**/*index.js"
/*window.cc = controllers 
console.log("CCCC")
console.log(cc)
controllers.forEach((controller) => {
  application.register(
    controller.name, 
    controller.module.default
  )
})*/

controllers.forEach((controller) => {
  if(controller.module.default){
    const name = controller.name.replace("--index.js", "")
    console.log("ADDINDG CONTROLLER", name)
    application.register(name, controller.module.default);
  }
});

console.log(application)
