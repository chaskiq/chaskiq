import {
  translations
} from '../../support'

describe('Customization Spec', function () {
  beforeEach(() => {
    cy.appEval('ActiveJob::Base.queue_adapter = :test')
    cy.appEval('ActiveJob::Base.queue_adapter.perform_enqueued_at_jobs = true')
  })

  it.only('wakeup & toggle method', function () {
    cy.appScenario('basic')

    translations()

    cy.appEval('App.last').then((results) => {
      const appKey = results.key

      cy.visit(`/tester/${appKey}`)
        .then(() => {
          cy.get('iframe:first')
            .then(function ($iframe) {
              const $body = $iframe.contents().find('body')
              // cy.wrap($body).find("#chaskiq-prime").click()
            })

          cy.window().then((win) => {
            cy.wait(2000)
            cy.get('iframe:first')
              .then(function ($iframe) {
                const $body = $iframe.contents().find('body')
                //console.log($body.html())
                //expect($body.html()).to.not.contain('Start a conversation')
                cy.get("#frame-wrapper[data-open=false]") //.should('not.be.visible')
              }).then(() => {
            
                 win.chaskiqMessenger.sendCommand('wakeup', {})

                 cy.get("#frame-wrapper[data-open=true]").then(()=>{

                  win.chaskiqMessenger.sendCommand('toggle', {})
                  cy.get("#frame-wrapper[data-open=false]")

                 })
   
              })
          })
        })
    })
  })
})
