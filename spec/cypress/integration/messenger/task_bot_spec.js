describe('Task bot Spec', function() {
  beforeEach(() => {
    cy.app('clean') // have a look at cypress/app_commands/clean.rb
    cy.appEval('ActiveJob::Base.queue_adapter = :test')
    cy.appEval('ActiveJob::Base.queue_adapter.perform_enqueued_at_jobs = true')
    //cy.appEval('Redis.current.del("app_user:1:trigger_locked")')
  })

  it('sessionless', function() {

    cy.appScenario('app_bot_settings', {email_requirement: 'never'}).then(()=>{

      cy.appEval("App.last").then((results) => {
        const appKey = results.key
  
        cy.visit(`/tester/${appKey}?sessionless=true&lang=en`).then(()=>{
  
          cy.get('iframe:first')
          .then(function ($iframe) {
              const $body = $iframe.contents().find('body')
              cy.wrap($body).find("#chaskiq-prime").click()
          })
  
          cy.get('iframe:first')
          .then(function ($iframe) {
              const $body = $iframe.contents().find('body')
              expect($body.html()).to.contain('Start a conversation')
              
              cy.wrap($body)
              .xpath("/html/body/div/div/div/div[2]/div/div[1]/div/div/div[2]/a[1]")
              .click()
              .then(()=>{
  
                cy.wrap($body)
                .xpath("/html/body/div/div/div/div[2]/div/div/div/div[2]/div/div/textarea")
                .should('be.enabled').then(()=>{
                  cy.wrap($body)
                  .xpath("/html/body/div/div/div/div[2]/div/div/div/div[2]/div/div/textarea")
                  .type("oeoe \n")
                  
                  cy.wrap($body).contains("will reply as soon as they can.")
                })
              })
          })
        })
      })

    })
  })


  it('sessionless 2', function() {
    
    cy.wait(6000)

    cy.appScenario('app_bot_settings', {email_requirement: 'Always'}).then((results) => {
      cy.appEval("App.last").then((results) => {
        const appKey = results.key
        cy.visit(`/tester/${appKey}?sessionless=true&lang=en`).then(()=>{

          cy.get('iframe:first')
          .then(function ($iframe) {
              const $body = $iframe.contents().find('body')
              cy.wrap($body).find("#chaskiq-prime").click()
          })

          cy.get('iframe:first')
          .then(function ($iframe) {
              const $body = $iframe.contents().find('body')
              expect($body.html()).to.contain('Start a conversation')
              
              cy.wrap($body)
              .xpath("/html/body/div/div/div/div[2]/div/div[1]/div/div/div[2]/a[1]")
              .click()
              .then(()=>{

                cy.wrap($body)
                .xpath("/html/body/div/div/div/div[2]/div/div/div/div[2]/div/div/textarea")
                .should('be.enabled').then(()=>{
                  cy.wrap($body)
                  .xpath("/html/body/div/div/div/div[2]/div/div/div/div[2]/div/div/textarea")
                  .type("oeoe \n")
                  
                  cy.wrap($body).contains("will reply as soon as they can.")

                  cy.wrap($body).contains("oeoe")
                  cy.wrap($body).contains("Are you an existing customer ?")
                  cy.wrap($body).contains("I'm existing customer").click()
                  cy.wrap($body).contains("Enter your email")
                  
                  cy.wrap($body)
                  .xpath('/html/body/div/div/div/div[2]/div/div/div/div[1]/div[1]/form/div/input')
                  .type('John@apple.cl')

                  cy.wrap($body)
                  .xpath('/html/body/div/div/div/div[2]/div/div/div/div[1]/div[1]/form/div/button')
                  .click()

                  cy.wrap($body).contains("thank you")

                })
              })
          })
        })
      })
    })
  })



  it('sessionless 3', function() {

    cy.wait(6000)

    cy.appScenario('app_bot_settings', {email_requirement: 'never'}).then(()=>{
      cy.appEval("App.last").then((results) => {
        const appKey = results.key
        cy.visit(`/tester/${appKey}?sessionless=true&lang=en`).then(()=>{
  
          cy.get('iframe:first')
          .then(function ($iframe) {
              const $body = $iframe.contents().find('body')
              cy.wrap($body).find("#chaskiq-prime").click()
          })
  
          cy.get('iframe:first')
          .then(function ($iframe) {
              const $body = $iframe.contents().find('body')
              expect($body.html()).to.contain('Start a conversation')
              
              cy.wrap($body)
              .xpath("/html/body/div/div/div/div[2]/div/div[1]/div/div/div[2]/a[1]")
              .click()
              .then(()=>{
  
                cy.wrap($body)
                .xpath("/html/body/div/div/div/div[2]/div/div/div/div[2]/div/div/textarea")
                .should('be.enabled').then(()=>{
                  cy.wrap($body)
                  .xpath("/html/body/div/div/div/div[2]/div/div/div/div[2]/div/div/textarea")
                  .type("oeoe \n")
                  
                  //cy.wrap($body).contains("will reply as soon as they can.")
  
                  //cy.wrap($body).contains("oeoe")
                  //cy.wrap($body).contains("Are you an existing customer ?")
                  //cy.wrap($body).contains("I'm existing customer").click()
                  //cy.wrap($body).contains("Enter your email")
                  
                  
  
                })
              })
          })
        })
      })
    })
  })
})