
import {
  login,
  findButtonByName,
  findElementByName
} from '../../support'

describe('Settings Spec', function () {
  beforeEach(() => {
  })

  it('Team view + invite view', function () {
    login()
    cy.visit('/apps')

    cy.contains('my app').click()

    cy.get("a[aria-label='Settings']")
      .click({ force: true }).then(() => {
        cy.get('body').should('contain', 'App Settings')
        cy.get('body').should('contain', 'Messenger Settings')
        cy.get('body').should('contain', 'Integrations')
        cy.get('body').should('contain', 'Webhooks')
        cy.get('body').should('contain', 'API Access')

        cy.contains('Team').click()

        cy.contains("Email")
        cy.contains("Name")
        cy.contains("Owner")
        cy.contains("Access List")
        cy.contains("Actions")

        cy.contains('div', 'chaskiq bot')
        cy.contains('a', 'edit link')
        cy.contains('button', 'remove')

        cy.contains('div', 'test@test.cl')

        cy.contains('div', 'sharleena')

        cy.contains('Invitations').click()

        cy.contains("Email")
        cy.contains("Actions")
        cy.contains("Add Team Member")
      })

  })
})