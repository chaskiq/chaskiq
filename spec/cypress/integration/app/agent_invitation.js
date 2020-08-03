
import {login} from '../../support/utils'

describe('Login Spec', function() {
  beforeEach(() => {
    cy.appScenario('basic')
  })

  it('Sign in view', function() {
    cy.appScenario('invitation')
    cy.appEval(`
      a = Agent.last;
      a.send( :generate_invitation_token!); 
      a.raw_invitation_token
    `).then((token)=>{
        cy.visit(`/agents/invitation/accept?invitation_token=${token}`).then(()=>{
          cy.contains('Set password').should('exist');
          cy.wait(1000)
          cy.xpath('//*[@id="password"]').type("123456")
          cy.xpath('//*[@id="password_confirmation"]').type("123456")
          cy.contains('Set my password').click()
          cy.contains('my app').should('exist')
        })

      })
  })
})