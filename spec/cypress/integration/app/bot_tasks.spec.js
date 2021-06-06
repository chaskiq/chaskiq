
import {
  login
} from '../../support/utils'

describe('Bot Tasks', function () {
  beforeEach(() => {
    cy.appEval(`
      require 'app_packages_catalog'
      AppPackagesCatalog.update_all 
    `)
  })

  it('Insert AppPackages', function () {
    login()
    cy.visit('/apps')

    cy.contains('my app').click()

    cy.get("a[aria-label='Routing Bots']")
      .click({ force: true }).then(() => {
        cy.get('body').should('contain', 'Outbound')
        cy.get('body').should('contain', 'New conversations')
        cy.get('body').should('contain', 'Bot Tasks')

        cy.contains('Outbound').click()
        cy.contains('Create a new one').click()

        cy.get('input#title').type('my super task')
        cy.get('[data-cy="bot-task-create"]').click()

        cy.contains('Editor').click()

        cy.contains('Add new path').click()
        cy.get('input[placeholder="write path title"]').type('foo')
        cy.get('[data-cy="bot-task-create-path"]').click()

        cy.contains('foo').click()

        cy.contains('Add new conversation part').click().then(() => {
          cy.contains('Add App').click()
          cy.get('[data-cy=add-package-ContentShowcase]').click()

          cy.contains('Pick a template')
          cy.contains('Announcement').click()

          cy.contains('Customize').click()

          cy.get('input[name="heading"]').type('Hello, World')
          cy.get('input[name="page_url"]').type('https://github.com/rails/rails')
          cy.contains('autofill inputs with page details').click()

          cy.get('input[name="title"]').should('have.value', 'rails/rails')
          cy.get('input[name="cover_image"]').should('not.have.value', '')

          cy.contains('Add to messenger home').click().then(() => {
            cy.contains('Send App').should('not.be.disabled')
            
            cy.get('[data-cy=send-app-ContentShowcase').click()
            cy.contains('Hello, World')

          })
        })
      })
  })
})
