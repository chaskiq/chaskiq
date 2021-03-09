import {
  translations
} from '../../support/utils'

describe('Customization Spec', function () {
  beforeEach(() => {
    cy.appEval('ActiveJob::Base.queue_adapter = :test')
    cy.appEval('ActiveJob::Base.queue_adapter.perform_enqueued_at_jobs = true')
  })

  it('wakeup & toggle method', function () {
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
            cy.get('iframe:first')
              .then(function ($iframe) {
                const $body = $iframe.contents().find('body')
                expect($body.html()).to.not.contain('Start a conversation')
              }).then(() => {
                win.chaskiqMessenger.sendCommand('wakeup', {})

                cy.get('iframe:first')
                  .then(function ($iframe) {
                    const $body = $iframe.contents().find('body')
                    expect($body.html()).to.contain('Start a conversation')
                  }).then(() => {
                    cy.wait(600).then(() => {
                      win.chaskiqMessenger.sendCommand('toggle', {})

                      cy.get('iframe:first')
                        .then(function ($iframe) {
                          const $body = $iframe.contents().find('body')
                          expect($body.html()).to.not.contain('Start a conversation')
                        })
                    })
                  })
              })
          })
        })
    })
  })
})
