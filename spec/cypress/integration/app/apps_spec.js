
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
            })


          })
        })


      })
    })
  })
})