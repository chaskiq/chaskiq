
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
        cy.visit(`/tester/${appKey}`,{qs: {old_embed: true}}).then(() => {
          cy.get('#messageFrame')
          cy.visit(`/tester/${appKey}`,{qs: {old_embed: true}}).then(() => {
            cy.get('#messageFrame').should('not.exist')
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
        cy.visit(`/tester/${appKey}`, {qs: {old_embed: true}}).then(() => {
          cy.get('#messageFrame')
          cy.visit(`/tester/${appKey}`, {qs: {old_embed: true}}).then(() => {
            cy.get('#messageFrame').should('exist')
            cy.get('#messageFrame').then(function ($iframe) {
              const $body = $iframe.contents().find('body')
              cy.wrap($body)
                .xpath('/html/body/main/div/div/div/div/div/div[2]/a')
                .click()

              cy.visit(`/tester/${appKey}`, {qs: {old_embed: true}}).then(() => {
                cy.get('#messageFrame').should('not.exist')
              })
            })
          })
        })
      })
    })
  })
})
