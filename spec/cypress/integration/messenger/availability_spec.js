
import moment from 'moment'

function handle2digits (time) {
  return `${time.getMinutes() < 10 ? '0' : ''}${time.getMinutes()}`
}

function handle2digitsH (time) {
  return `${time.getHours() < 10 ? '0' : ''}${time.getHours()}`
}

function setTime (diff) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const now = moment()
  const aa = moment()
  const diffTime = now.add(diff, 'hours')
  const nowTime = `${handle2digitsH(aa._d)}:${handle2digits(aa._d)}`
  const weekday = days[now._d.getDay()]
  const startTime = `${handle2digitsH(diffTime._d)}:${handle2digits(diffTime._d)}`
  const moremin = diffTime.add(15, 'minutes')
  const endTime = `${handle2digitsH(moremin._d)}:${handle2digits(moremin._d)}`

  console.log('now: ', weekday, nowTime)
  console.log('setting: ', weekday, startTime, endTime)

  return [now, weekday, startTime, endTime, days[diffTime._d.getDay()]]
}

describe('Availability spec', function () {
  beforeEach(() => {
    cy.appEval('ActiveJob::Base.queue_adapter = :test')
    cy.appEval('ActiveJob::Base.queue_adapter.perform_enqueued_at_jobs = true')
  })

  it.skip('next week', function () {
    cy.appScenario('basic')

    const [now, weekday, startTime, endTime, diffTime] = setTime(-3)

    cy.appEval(`App.last.update(timezone: 'UTC', 
    team_schedule: [{ day: "${weekday.toLowerCase()}", from: "${startTime}", to: "${endTime}" }])`)

    cy.appEval('App.last').then((results) => {
      const appKey = results.key
      cy.visit(`/tester/${appKey}`).then(() => {
        cy.get('iframe:first')
          .then(function ($iframe) {
            const $body = $iframe.contents().find('body')
            cy.wrap($body).find('#chaskiq-prime').click()
          })
        cy.get('iframe:first')
          .then(function ($iframe) {
            const $body = $iframe.contents().find('body')
            expect($body.html()).to.contain('next week')
          })
      })
    })

    cy.appEval('App.last').then((results) => {
      const appKey = results.key
      cy.visit(`/tester/${appKey}?lang=es`).then(() => {
        cy.get('iframe:first')
          .then(function ($iframe) {
            const $body = $iframe.contents().find('body')
            cy.wrap($body).find('#chaskiq-prime').click()
          })
        cy.get('iframe:first')
          .then(function ($iframe) {
            const $body = $iframe.contents().find('body')
            expect($body.html()).to.contain('proxima semana')
          })
      })
    })
  })

  it.skip('tomorrow', function () {
    cy.appScenario('basic')

    const [now, weekday, startTime, endTime, diffTime] = setTime(24)

    cy.appEval(`App.last.update(timezone: 'UTC', 
    team_schedule: [{ day: "${diffTime.toLowerCase()}", from: "${startTime}", to: "${endTime}" }])`)

    cy.appEval('App.last').then((results) => {
      const appKey = results.key
      cy.visit(`/tester/${appKey}`).then(() => {
        cy.get('iframe:first')
          .then(function ($iframe) {
            const $body = $iframe.contents().find('body')
            cy.wrap($body).find('#chaskiq-prime').click()
          })
        cy.get('iframe:first')
          .then(function ($iframe) {
            const $body = $iframe.contents().find('body')
            expect($body.html()).to.contain("we'll back online tomorrow")
          })
      })
    })

    cy.appEval('App.last').then((results) => {
      const appKey = results.key
      cy.visit(`/tester/${appKey}?lang=es`).then(() => {
        cy.get('iframe:first')
          .then(function ($iframe) {
            const $body = $iframe.contents().find('body')
            cy.wrap($body).find('#chaskiq-prime').click()
          })
        cy.get('iframe:first')
          .then(function ($iframe) {
            const $body = $iframe.contents().find('body')
            expect($body.html()).to.contain('mañana')
          })
      })
    })
  })

  it.skip('couple of hours', function () {
    cy.appScenario('basic')

    const [now, weekday, startTime, endTime, diffTime] = setTime(1)

    console.log(diffTime, startTime)

    cy.appEval(`App.last.update(timezone: 'UTC', 
    team_schedule: [{ day: "${diffTime.toLowerCase()}", from: "${startTime}", to: "${endTime}" }])`)

    cy.appEval('App.last').then((results) => {
      const appKey = results.key
      cy.visit(`/tester/${appKey}?lang=en`).then(() => {
        cy.get('iframe:first')
          .then(function ($iframe) {
            const $body = $iframe.contents().find('body')
            cy.wrap($body).find('#chaskiq-prime').click()
          })
        cy.get('iframe:first')
          .then(function ($iframe) {
            const $body = $iframe.contents().find('body')
            expect($body.html()).to.contain('approximately')
          })
      })
    })

    cy.appEval('App.last').then((results) => {
      const appKey = results.key
      cy.visit(`/tester/${appKey}?lang=es`).then(() => {
        cy.get('iframe:first')
          .then(function ($iframe) {
            const $body = $iframe.contents().find('body')
            cy.wrap($body).find('#chaskiq-prime').click()
          })
        cy.get('iframe:first')
          .then(function ($iframe) {
            const $body = $iframe.contents().find('body')
            expect($body.html()).to.contain('aprox')
          })
      })
    })
  })
})
