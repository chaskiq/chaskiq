
describe('Login Spec', function () {
  beforeEach(() => {
    cy.appScenario('basic')
    cy.appScenario('invitation')
  })

  it('Sign in view', function () {
    cy.appEval(`
      a = Agent.last;
      a.send( :generate_invitation_token!);
      a.raw_invitation_token
    `).then((token) => {
      cy.visit(`/agents/invitation/accept?invitation_token=${token}`,{ failOnStatusCode: false }).then(() => {
        cy.get('input[placeholder="Type your password"]').should('exist')
        cy.wait(1000)
        cy.xpath('//*[@id="agent_password"]').type('123456')
        cy.xpath('//*[@id="agent_password_confirmation"]').type('123456')
        cy.contains('Set my password').click()
        cy.contains('my app').should('exist')
      })
    })
  })

  it('validates password match', function () {
    cy.appEval(`
      a = Agent.last;
      a.send( :generate_invitation_token!);
      a.raw_invitation_token
    `).then((token) => {
      cy.visit(`/agents/invitation/accept?invitation_token=${token}`, { failOnStatusCode: false }).then(() => {
        cy.get('input[placeholder="Type your password"]').should('exist')
        cy.wait(1000)
        cy.xpath('//*[@id="agent_password"]').type('123456')
        cy.xpath('//*[@id="agent_password_confirmation"]').type('1234567')
        cy.contains('Set my password').click()
        cy.contains("Password confirmation doesn't match Password").should('exist')
      })
    })
  })
})
