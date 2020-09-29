
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
    cy.visit('/apps')

    cy.contains('my app').click()

    cy.get("a[aria-label='Settings']")
      .click({ force: true }).then(() => {
        cy.get('body').should('contain', 'App Settings')
        cy.get('body').should('contain', 'Team')
        cy.get('body').should('contain', 'Integrations')

        cy.contains('Integrations').click()
        cy.contains('You are not authorized to perform this action')
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
            cy.xpath('/html/body/div[1]/div[2]/div[2]/div[2]/main/div/div/div/div[2]/div[2]/div/div/ul/li[1]/div/div/div/div/div[2]/div/div/button')
              .click()

            cy.contains('Update').click()
            cy.contains('Integration created')
            cy.contains('This is the third party API integrations section.')
          })
        })
    })

    it.only('Home apps app packages', function () {  
      cy.visit('/apps')
      cy.contains('my app').click()
      cy.get("a[aria-label='Settings']")
        .click({ force: true }).then(() => {

          cy.contains('Messenger settings').click().then(() => {
            cy.wait(500)
            cy.contains("Apps").click()
            cy.contains('Add apps to your Messenger')
            findButtonByName('Add app').click()

            cy.contains('Add apps to chat home')
            cy.xpath('/html/body/div[1]/div[2]/div[2]/div[2]/main/div/div/div/div[2]/div[2]/div/div[2]/div[2]/div/div[2]/div[2]/div/div/div/div/div/ul/li[1]/div/div/div/div/div[2]/div/div/button')
            .click()

            cy.contains('Pick a template')
            cy.contains('Announcement').click()

            cy.contains('Customize').click()

            cy.get('input[name="heading"]').type('Hello, World')
            cy.get('input[name="page_url"]').type('https://github.com/rails/rails')
            cy.contains('autofill inputs with page details').click()

            cy.get('input[name="title"]').should('have.value', 'rails/rails')
            cy.get('input[name="cover_image"]').should('not.have.value', '')

            cy.contains('Add to messenger home').click()

            cy.contains('ContentShowcase')
            cy.contains('Save changes').click()
          })
        })
    })
  })
})
