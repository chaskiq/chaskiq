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
    cy.appEval('ActiveJob::Base.queue_adapter = :test')
    cy.appEval('ActiveJob::Base.queue_adapter.perform_enqueued_at_jobs = true')
  })

  it('display colourful', function() {
    cy.appScenario('basic')

    cy.appEval(`App.last.update(customization_colors: {
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

    cy.appEval(`App.last.update(customization_colors: nil )`)

    translations()
    openMessenger(($body)=>{
      cy.appEval("App.last").then((res)=>{
        expect(res.preferences.customization_colors).to.not.exist
      })
    }, {params: {lang: 'en'}} )
  })


  it('display default on secondary color', function() {
    cy.appScenario('basic')

    cy.appEval(`App.last.update(customization_colors: {
      primary: "#0f0",
      pattern: 'https://www.toptal.com/designers/subtlepatterns/patterns/spikes.png'
    })`)

    translations()
    openMessenger(($body)=>{
      cy.appEval("App.last").then((res)=>{
        expect(res.preferences.customization_colors).to.exist
      })
    }, {params: {lang: 'en'}} )
  })

})