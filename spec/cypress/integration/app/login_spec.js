

describe('Login Spec', function() {
  beforeEach(() => {
    cy.app('clean') // have a look at cypress/app_commands/clean.rb
  })

  it('Sign in view', function() {
    cy.appScenario('basic')

    cy.visit('/')

    cy.contains("Sign in")

    cy.get('input[name="email"]')
    .type('test@test.cl').should('have.value', 'test@test.cl')

    cy.get('input[name="password"]')
    .type('123456').should('have.value', '123456')

    cy.get('button[type="submit"]').click()
    cy.get("body").should('contain', 'Welcome to Chaskiq')
  })



  /*it('example of missing scenario failure', function() {
    cy.visit('/')
    cy.appScenario('basic')
    // cy.appScenario('missing') // uncomment these if you want to see what happens
  })

  it('example of missing app failure', function() {
    cy.visit('/')
    cy.appScenario('basic')
    // cy.app('run_me') // uncomment these if you want to see what happens
  })*/
})