
import {
  login,
  findButtonByName
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
        cy.get('body').should('contain', 'For Users')
        cy.get('body').should('contain', 'For Leads')
        cy.get('body').should('contain', 'Settings')

        cy.contains('For Users').click()
        cy.contains('Create a new one').click()

        cy.get("input#title").type("my super task")
        cy.xpath('/html/body/div[1]/div[2]/div[2]/div[2]/div[2]/div/div[2]/div[3]/button[2]')
          .click()

        cy.contains('Editor').click()

        cy.contains('Add new path').click()
        cy.get('input[placeholder="write path title"]').type("foo")
        cy.xpath('/html/body/div[1]/div[2]/div[2]/div[2]/div[2]/main/div/div/div/div[2]/div[2]/div/div[1]/div[2]/div[3]/button[2]')
          .click()

        cy.contains('foo').click()

        cy.contains('Add new conversation part').click().then(()=>{
          cy.contains('Add App').click()
          cy.xpath('/html/body/div[1]/div[2]/div[2]/div[2]/div[2]/main/div/div/div/div[2]/div[2]/div/div[3]/div[2]/div[2]/div/div/div/div/div/ul/li[1]/div/div/div/div/div[2]/div/div/button')
            .click()

          cy.contains('Pick a template')
          cy.contains('Announcement').click()
  
          cy.contains('Customize').click()
  
          cy.get('input[name="heading"]').type('Hello, World')
          cy.get('input[name="page_url"]').type('https://github.com/rails/rails')
          cy.contains('autofill inputs with page details').click()
  
          cy.get('input[name="title"]').should('have.value', 'rails/rails')
          cy.get('input[name="cover_image"]').should('not.have.value', '')

          cy.contains('Add to messenger home').click().then(()=>{
            cy.contains('Send App').should('not.be.disabled').then(()=>{
              cy.wait(2000)
              cy.xpath('/html/body/div[1]/div[2]/div[2]/div[2]/div[2]/main/div/div/div/div[2]/div[2]/div/div[3]/div[2]/div[3]/button[2]')
                .click()  
              cy.contains("Hello, World")
            })
          })

        })
      })
  })
})
