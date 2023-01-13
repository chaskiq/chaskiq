
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

        cy.contains('td', 'chaskiq bot')  
          .siblings()
          /*.within(() => {
            cy.contains('button', 'Edit') 
            cy.contains('button', 'Delete') 
          }) */                         
          .contains('td', 'chaskiq bot') 
        
        cy.contains('td', 'test@test.cl')  
          .siblings()
         /* .within(() => {
            cy.contains('button', 'Edit') 
            cy.contains('button', 'Delete') 
            cy.contains('span', 'admin') 
          }) */                            
          .contains('td', 'sharleena') 

        cy.contains('Invitations').click()

        cy.contains("Email")
        cy.contains("Actions")
        cy.contains("Add Team Member")
      })

  })
})