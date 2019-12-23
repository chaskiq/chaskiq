
import {
  login, 
  findButtonByName, 
  findElementByName
} from '../../support/utils'

describe('Login Spec', function() {
  beforeEach(() => {
    cy.app('clean') // have a look at cypress/app_commands/clean.rb
  })

  it('Sign in view + dashboard view', function() {
    login()
    cy.visit('/apps')

    cy.get("body").should('contain', 'my app enabled').then(()=>{
      findButtonByName("View app").click().then(()=>{

        cy.get("body").should('contain', 'Visit activity')
        cy.get("body").should('contain', 'New conversations')
        cy.get("body").should('contain', 'Resolutions')
        cy.get("body").should('contain', 'Incoming Messages')

        cy.xpath('//*[@id="main-page"]/div/div[3]/header/div/div/div[5]/div/button')
        .click().then(()=>{
          findElementByName("li", "Create new app").click().then(()=>{
            cy.get('body').should('contain', 'Create your company’s Chaskiq app')

            cy.get('input[name="app[name]"]')
            .type('test test')
            .should('have.value', 'test test')

            cy.get('input[name="app[domainUrl]"]')
            .type("http://test.cl")
            .should('have.value', 'http://test.cl')

            findButtonByName("Save settings").click().then(()=>{
              cy.get("body").should('contain', 'Visit activity')
              cy.get("body").should('contain', 'New conversations')
              cy.get("body").should('contain', 'Resolutions')
              cy.get("body").should('contain', 'Incoming Messages') 
              
              
              findElementByName("li", "Platform").click().then(()=>{
                cy.get("body").should("contain", "all users")
                cy.get("body").should("contain", "all leads")
                cy.get("body").should("contain", "active users")
                cy.get("body").should("contain", "sleeping away")
              })

              findElementByName("li", "Conversations").click().then(()=>{
                cy.get("body").should("contain", "Conversations")
                cy.get("body").should("contain", "Assignment Rules")
              })

              findElementByName("li", "Campaigns").click().then(()=>{
                cy.get("body").should("contain", "Mailing Campaigns")
                cy.get("body").should("contain", "In App messages")
                cy.get("body").should("contain", "Guided tours")
              })

              findElementByName("li", "Routing Bots").click().then(()=>{
                cy.get("body").should("contain", "For Leads")
                cy.get("body").should("contain", "For Users")
                cy.get("body").should("contain", "Settings")
              })


              findElementByName("li", "Settings").click().then(()=>{
                cy.get("body").should("contain", "App Settings")
                cy.get("body").should("contain", "Team")
                cy.get("body").should("contain", "Integrations")
              })

            })


          })
        })


      })
    })
  })
})