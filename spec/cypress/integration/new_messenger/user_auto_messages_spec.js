
describe('Conversation Spec', function () {
  it('will open message and dissapear on second visit', function () {
    cy.appScenario('basic')

    cy.appEval('App.last').then((results) => {
      const appKey = results.key
      cy.app('user_auto_message', {
        app_key: appKey,
        text: "Hey",
        hidden_constraints: { hidden_constraints: ['open'] }
      }).then(() => {
        cy.visit(`/tester/${appKey}`).then(() => {
          cy.get('#chaskiq-user-auto-messages')
          cy.visit(`/tester/${appKey}`).then(() => {
            cy.get('#chaskiq-user-auto-messages').should('not.exist')
          })
        })
      })
    })
  })

  it('will open message on every visit until dissmiss', function () {
    cy.appScenario('basic')

    cy.appEval('App.last').then((results) => {
      const appKey = results.key
      cy.app('user_auto_message', {
        app_key: appKey,
        text: "Hey",
        hidden_constraints: { hidden_constraints: ['close'] }
      }).then(() => {
        cy.visit(`/tester/${appKey}`).then(() => {
          cy.get('#chaskiq-user-auto-messages')
          cy.visit(`/tester/${appKey}`).then(() => {
          

            cy.wait(2000)
            cy.get('#chaskiq-user-auto-messages')
            .should('exist')
            .then(function ($iframe) {

              const $body = $iframe.contents().find('body')
              console.log($body.html())

              console.log("AAAAAAAAA")
              cy.wrap($body).find('button[data-cy=user-auto-message-dismiss]').should('exist')
              /*cy.wrap($body).find('button[data-cy=user-auto-message-dismiss]').click()

              cy.visit(`/tester/${appKey}`).then(() => {
                cy.get('#chaskiq-user-auto-messages').should('not.exist')
              })*/
            })
          })
        })
      })
    })
  })
})
