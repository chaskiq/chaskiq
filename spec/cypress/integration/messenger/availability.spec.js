
import moment from 'moment'

describe('Availability spec', function() {
  beforeEach(() => {
    cy.app('clean') // have a look at cypress/app_commands/clean.rb
    cy.appEval('ActiveJob::Base.queue_adapter = :test')
    cy.appEval('ActiveJob::Base.queue_adapter.perform_enqueued_at_jobs = true')
  })

  it('next week', function() {
    cy.appScenario('basic')
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const now = moment()
    const yesterday = now.add(-1, 'hours')
    const weekday = days[yesterday._d.getDay()]

    const startTime = `${now._d.getHours()}:${now._d.getMinutes()}`

    const moremin = now.add(30, 'minutes')
    const endTime = `${moremin._d.getHours()}:${moremin._d.getMinutes()}`

    cy.appEval(`App.last.update(timezone: 'UTC', 
    team_schedule: [{ day: "${weekday.toLowerCase()}", from: "${startTime}", to: "${endTime}" }])`)
    
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
            expect($body.html()).to.contain("next week")
        })
      })
    })

    cy.appEval("App.last").then((results) => {
      const appKey = results.key
      cy.visit(`/tester/${appKey}?lang=es`).then(()=>{
        cy.get('iframe:first')
        .then(function ($iframe) {
            const $body = $iframe.contents().find('body')
            cy.wrap($body).find("#chaskiq-prime").click()
        })
        cy.get('iframe:first')
        .then(function ($iframe) {
            const $body = $iframe.contents().find('body')
            expect($body.html()).to.contain("proxima semana")
        })
      })
    })

  })


})