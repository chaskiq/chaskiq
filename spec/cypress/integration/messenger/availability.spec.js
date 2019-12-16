
import moment from 'moment'

describe('Availability spec', function() {
  beforeEach(() => {
    cy.app('clean') // have a look at cypress/app_commands/clean.rb
    cy.appEval('ActiveJob::Base.queue_adapter = :test')
    cy.appEval('ActiveJob::Base.queue_adapter.perform_enqueued_at_jobs = true')
  })

  it('next week', function() {


    function handle2digits(time){
      return `${time.getMinutes()<10?'0':''}${time.getMinutes()}`
    }

    cy.appScenario('basic')
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const now = moment()

    const aa = moment()

    const yesterday = now.add(-3, 'hours')
    const nowTime = `${aa._d.getHours()}:${handle2digits(aa._d)}`

    const weekday = days[now._d.getDay()]

    const startTime = `${yesterday._d.getHours()}:${handle2digits(yesterday._d)}`
    const moremin = yesterday.add(15, 'minutes')
    const endTime = `${moremin._d.getHours()}:${handle2digits(moremin._d)}`
    debugger
    console.log("now: ", weekday, nowTime)
    console.log("setting: ", weekday, startTime, endTime)

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