
import {
  login,
  findButtonByName,
  findElementByName
} from '../../support/utils'

describe('Login Spec', function () {
  beforeEach(() => {
  })

  it('Sign in view + dashboard view', function () {
    login()
    cy.visit('/apps')

    cy.get('body').should('contain', 'my app').then(() => {
      // debugger
      // findButtonByName("View app").click()
      cy.get('a').contains('my app').click().then(() => {
        cy.get('body').should('contain', 'Visit activity')
        cy.get('body').should('contain', 'New conversations')
        cy.get('body').should('contain', 'Resolutions')
        cy.get('body').should('contain', 'Incoming Messages')

        // cy.xpath('//*[@id="main-page"]/div/div[1]/nav/div/div/ul/button')
        cy.get('#user_menu')
          .click().then(() => {
            findElementByName('button', 'Create new app').click().then(() => {
              cy.get('body').should('contain', 'Create your company’s Chaskiq app')

              cy.get('input[name="app[name]"]')
                .type('test test')
                .should('have.value', 'test test')

              cy.get('input[name="app[domainUrl]"]')
                .type('http://test.cl')
                .should('have.value', 'http://test.cl')

              findButtonByName('Save').click().then(() => {
                cy.get('body').should('contain', 'Visit activity')
                cy.get('body').should('contain', 'New conversations')
                cy.get('body').should('contain', 'Resolutions')
                cy.get('body').should('contain', 'Incoming Messages')

                cy.get("a[aria-label='Platform']")
                  .click({ force: true }).then(() => {
                    cy.get('body').should('contain', 'all users')
                    cy.get('body').should('contain', 'all leads')
                    cy.get('body').should('contain', 'active users')
                    cy.get('body').should('contain', 'sleeping away')
                  })

                cy.get("a[aria-label='Conversations']")
                  .click({ force: true }).then(() => {
                    cy.get('body').should('contain', 'Conversations')
                    cy.get('body').should('contain', 'Assignment Rules')
                  })

                cy.get("a[aria-label='Campaigns']")
                  .click({ force: true }).then(() => {
                    cy.get('body').should('contain', 'Mailing Campaigns')
                    cy.get('body').should('contain', 'In App Messages')
                    cy.get('body').should('contain', 'Guided Tours')
                  })

                cy.get("a[aria-label='Routing Bots']")
                  .click({ force: true }).then(() => {
                    cy.get('body').should('contain', 'Outbound')
                    cy.get('body').should('contain', 'New conversations')
                    cy.get('body').should('contain', 'Bot Tasks')
                  })

                cy.get("a[aria-label='Settings']")
                  .click({ force: true }).then(() => {
                    cy.get('body').should('contain', 'App Settings')
                    cy.get('body').should('contain', 'Team')
                    cy.get('body').should('contain', 'Integrations')
                  })
              })
            })
          })
      })
    })
  })
})
