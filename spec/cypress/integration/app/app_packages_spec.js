
import {
  login,
  findButtonByName
} from '../../support/utils'

describe('AppPackages', function () {
  beforeEach(() => {
    cy.appEval(`
      require 'app_packages_catalog'
      AppPackagesCatalog.update_all 
    `)
  })

  it('Manage AppPackages', function () {
    login()

    cy.appEval(`
      app = Agent.find_by(email: 'test@test.cl')
      app.roles.map{|o| o.update(role: "agent")}
    `)

    cy.visit('/apps')
    cy.contains('my app').click()
    cy.get("a[aria-label='Settings']").click({ force: true })
    cy.get("a[aria-label='App Settings']").click({ force: true })
    
    cy.contains('Access denied')

  })

  it('Manage AppPackages', function () {
    login()

    cy.appEval(`
      app = Agent.find_by(email: 'test@test.cl')
      app.roles.map{|o| o.update(role: "admin_only")}
    `)

    cy.visit('/apps')
    cy.contains('my app').click()

    cy.get("a[aria-label='Settings']")
      .click({ force: true }).then(() => {
        cy.get('body').should('contain', 'App Settings')
        cy.get('body').should('contain', 'Team')
        cy.get('body').should('contain', 'Integrations')

        cy.contains('Integrations').click()
        cy.contains('Third party integrations')
      })
  })

  describe('AppPackages', function () {
    beforeEach(() => {
      login()
      cy.appEval(`
        App.last.update(owner_id: Agent.find_by(email: 'test@test.cl').id)
      `)
    })

    it('Add AppPackages', function () {
      cy.visit('/apps')
      cy.contains('my app').click()
      cy.get("a[aria-label='Settings']")
        .click({ force: true }).then(() => {
          cy.get('body').should('contain', 'Integrations')

          cy.contains('Integrations').click()
          cy.contains("Available API's").click().then(() => {
            cy.get('[data-cy=services-Reveniu-add]').click()

            cy.contains('Update').click()
            cy.contains('Integration created')
            cy.contains('This is the third party API integrations section.')
          })
        })
    })

    it('Home apps app packages', function () {
      cy.visit('/apps')
      cy.contains('my app').click()
      cy.get("a[aria-label='Settings']")
        .click({ force: true }).then(() => {
          cy.contains('Messenger settings').click().then(() => {
            cy.wait(500)
            cy.contains('Apps').click()
            cy.contains('Add apps to your Messenger')
            findButtonByName('Add app').click()

            cy.contains('Add apps to chat home')

            cy.contains('ContentShowcase').then(($d) => {
              $d.parent().parent().find('button').click()
            })

            cy.contains('Pick a template')
            cy.contains('Announcement').click()

            cy.contains('Customize').click()

            cy.get('input[name="heading"]').type('Hello, World')
            cy.get('input[name="page_url"]').type('https://github.com/rails/rails')
            cy.contains('autofill inputs with page details').click()

            cy.get('input[name="title"]').should('have.value', 'GitHub - rails/rails: Ruby on Rails')
            cy.get('input[name="cover_image"]').should('not.have.value', '')

            cy.contains('Add to messenger home').click()

            cy.contains('ContentShowcase')
            cy.contains('Save').click()
          })
        })
    })
  })
})
