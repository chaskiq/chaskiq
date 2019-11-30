import {
  translations,
  openMessenger
} from '../../support/utils'


const defaultPredicates =  [
  {
    type: "match", 
    value: "and", 
    attribute: "match", 
    comparison: "and"
  }
]

describe('Customization Spec', function() {
  beforeEach(() => {
    cy.app('clean') // have a look at cypress/app_commands/clean.rb
    cy.appEval('ActiveJob::Base.queue_adapter = :test')
    cy.appEval('ActiveJob::Base.queue_adapter.perform_enqueued_at_jobs = true')
  })

  it('display colourful', function() {
    cy.appScenario('basic')

    cy.appEval(`App.last.update(customization_colors: {
      header: "#f00",
      primary: "#0f0",
      secondary: "#f00"
    })`)

    translations()
    openMessenger(($body)=>{
      cy.appEval("App.last").then((res)=>{
        expect(res.preferences.customization_colors).to.exist
      })
    }, {params: {lang: 'en'}} )
  })

  it('display default', function() {
    cy.appScenario('basic')

    /*cy.appEval(`App.last.update(customization_colors: {
      header: "#f00",
      primary: "#0f0",
      secondary: "#f00"
    })`)*/

    translations()
    openMessenger(($body)=>{
      cy.appEval("App.last").then((res)=>{
        expect(res.preferences.customization_colors).to.not.exist
      })
    }, {params: {lang: 'en'}} )
  })

})