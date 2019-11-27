

describe('Availability spec', function() {
  beforeEach(() => {
    cy.app('clean') // have a look at cypress/app_commands/clean.rb
    cy.appEval('ActiveJob::Base.queue_adapter = :test')
    cy.appEval('ActiveJob::Base.queue_adapter.perform_enqueued_at_jobs = true')
  })

  it('next week', function() {
    cy.appScenario('basic')

    cy.appEval(`App.last.update(timezone: 'UTC', 
    team_schedule: [{ day: 'tue', from: '01:00' , to: '01:30' }])`)
    
    cy.appEval("App.last").then((results) => {
      const appKey = results.key
     
      cy.visit(`/tester/${appKey}`).then(()=>{


        cy.get('iframe:first')
        .then(function ($iframe) {
            const $body = $iframe.contents().find('body')
            cy.wrap($body).find("#chaskiq-prime").click()
        })

        cy.get('iframe:first')
        .then(function ($iframe) {
            const $body = $iframe.contents().find('body')
            expect($body.html()).to.contain("volvemos la proxima semana")
        })


      })
     
    })
  })


})