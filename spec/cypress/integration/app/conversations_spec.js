
import {
  login
} from '../../support/utils'

describe('Conversations Spec', function () {
  beforeEach(() => {
    cy.appEval(`
      require 'app_packages_catalog'
      AppPackagesCatalog.update_all 
    `)
  })

  it('Send app package on conversation', function () {
    login()

    cy.appEval(`
      app_user = App.last.add_user(
        email: 'test@test2.cl', 
        name: 'ebola boli',
        first_name: 'some user'
      )
      
      App.last.start_conversation(
        message: { 
          text_content: 'hi from test backend',
          serialized_content: '{"blocks":[
            {"key":"bl82q","text":"some text from backend",
            "type":"unstyled",
            "depth":0,
            "inlineStyleRanges":[],
            "entityRanges":[],"data":{}}],
            "entityMap":{}}'
        },
        from: app_user
      )
    `)

    cy.visit('/apps')

    cy.contains('my app').click()

    cy.get("a[aria-label='Conversations']")
      .click({ force: true }).then(() => {

        cy.get('[data-cy=conversation-item]').first().click({force: true})
        //cy.xpath('/html/body/div/div[2]/div[2]/div[2]/div[2]/div[2]/div[2]/a')
        //  .click()

        cy.contains('some text from backend')

        cy.get('[contenteditable]').click()

        cy.get('[contenteditable]')
          .type('foo \r\n')

        // selects package button
        cy.get('[data-cy=inline-tooltip-button-AppPackage]').click()

        // selects content showcase
        cy.get('[data-cy=add-package-ContentShowcase]').click()

        cy.contains('Pick a template')
        cy.contains('Announcement').click()

        cy.contains('Customize').click()

        cy.get('input[name="heading"]').type('Hello, World')
        cy.get('input[name="page_url"]').type('https://github.com/rails/rails')
        cy.contains('autofill inputs with page details').click()

        cy.get('input[name="title"]').should('have.value', 'GitHub - rails/rails: Ruby on Rails')
        cy.get('input[name="cover_image"]').should('not.have.value', '')

        cy.contains('Add to messenger home').click().then(() => {
          cy.contains('Send App').should('not.be.disabled')
          cy.get('[data-cy=send-app-ContentShowcase]').click()
          cy.get('#message-id-2').contains('Hello, World')
        })
      })
  })
})
