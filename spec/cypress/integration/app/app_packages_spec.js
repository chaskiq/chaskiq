
import {
  login,
  findButtonByName
} from '../../support'

describe('AppPackages', function () {
  beforeEach(() => {
    cy.appEval(`
      Plugin.restore_plugins_from_fs
    `)
  })

  it('Manage AppPackages', function () {
    login()

    cy.appEval(`
      app = Agent.find_by(email: 'test@test.cl')
      app.roles.map{|o| o.update(role: "agent")}
      app.key
    `)

    cy.visit('/apps')
    cy.contains('my app').click()

    cy.get("a[aria-label='Settings']")
      .click({ force: true }).then(() => {
        cy.contains('Access denied')
      })
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
            cy.get('[data-cy=services-reveniu-add]').click()

            cy.contains('Save').click()
            cy.contains('Updated successfully')
          })
        })
    })

    it('Home apps app packages', function () {
      cy.visit('/apps')

      cy.contains('my app').click().then(()=>{

        cy.get("a[aria-label='Settings']")
        .click({ force: true }).then(() => {
          cy.contains('Messenger Settings').click().then(() => {
            cy.wait(500)
            cy.contains('Apps').click()
            cy.contains('Add apps to your Messenger')
            cy.get('a').contains('Add app').click()

            cy.contains('Send App Package')

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
          })
        })

      })

    })
  })
})
