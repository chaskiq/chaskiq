import helpers from './helpers.js'

function addPackage (app_package) {
  cy.appEval(`
    app = App.first
    app_package = AppPackage.find_by(name: "${app_package}")
    integration = app.app_package_integrations.new()
    integration.app_package = app_package
    integration.save
  `)
}

describe('Task bot Spec', function () {
  beforeEach(() => {
    cy.appEval('ActiveJob::Base.queue_adapter = :test')
    cy.appEval('ActiveJob::Base.queue_adapter.perform_enqueued_at_jobs = true')
    cy.appEval('Redis.current.del("app_user:1:trigger_locked")')
    cy.appEval(`
      require 'app_packages_catalog'
      AppPackagesCatalog.update_all 
    `)
  })

  it('sessionless bot task wait for reply', function () {
    cy.app('clean')
    cy.appScenario('basic').then((basic) => {
      cy.log('basic', JSON.stringify(basic))

      cy.appEval('App.last').then((results) => {
        const appKey = results.key
        cy.log('APP.last', JSON.stringify(results))

        cy.app('bot_task_command', {
          app_key: appKey
        }).then((res) => {
          cy.log('bot task command', JSON.stringify(res))

          cy.wait(2000)
          cy.visit(`/tester/${appKey}?sessionless=true`).then(() => {
            cy.wait(2000)

            cy.get('#messenger-frame iframe')
              .then(function ($iframe) {
                const $body = $iframe.contents().find('body')

                cy.wrap($body).contains('one')
                cy.wrap($body).contains('two')
                cy.wrap($body).contains('tree').then(() => {
                  cy.wait(1000)

                  cy.wrap($body)
                    .xpath('/html/body/div/div/div/div[2]/div[1]/main/div/div/div[4]/div/div/textarea')
                    .type('oeoe \n').then(() => {
                      cy.wrap($body).contains('four')
                    })
                })
              })
          })
        })
      })
    })
  })

  it('sessionless never ask email', function () {
    cy.appScenario('app_bot_settings', { email_requirement: 'never' }).then(() => {
      cy.appEval('App.last').then((results) => {
        const appKey = results.key

        cy.visit(`/tester/${appKey}?sessionless=true&lang=en`).then(() => {

          cy.wait(2000)

          cy.get('#chaskiq-prime').click().then(()=>{
            cy.get('iframe:first')
            .then(function ($iframe) {
              const $body = $iframe.contents().find('body')
              expect($body.html()).to.contain('Start a conversation')

              cy.wrap($body)
                .xpath('/html/body/div/div/div/div[2]/div[1]/div[1]/div/div/div/div[2]/div[2]/a[1]')
                .click()
                .then(() => {

                  cy.wait(2000)
                  cy.wrap($body).find('textarea')
                  .should('have.length', 1)
                  .type('oeoe \n')
      
                  cy.wrap($body).contains('will reply as soon as they can.')
              })
            })
          })
        })
      })
    })
  })

  it('sessionless 2 always ask email , email validation', function () {

    cy.appScenario('app_bot_settings', { email_requirement: 'Always' }).then((results) => {
      addPackage('Qualifier')

      cy.appEval('App.last').then((results) => {
        const appKey = results.key
        cy.visit(`/tester/${appKey}?sessionless=true&lang=en`).then(() => {
          
          cy.wait(2000)
          cy.get('#chaskiq-prime').click()

          cy.wait(2000)
          cy.get('iframe:first')
            .then(function ($iframe) {
              const $body = $iframe.contents().find('body')
              expect($body.html()).to.contain('Start a conversation')

              cy.wrap($body)
                .xpath('/html/body/div/div/div/div[2]/div[1]/div[1]/div/div/div/div[2]/div[2]/a[1]')
                .click()
                .then(() => {
                  cy.wrap($body).then(() => {
                    cy.wait(2000)
                    cy.wrap($body).find('textarea')
                    .should('have.length', 1)
                    .type('oeoe \n').then(() => {
                        cy.wait(2000)

                        cy.wrap($body).contains('will reply as soon as they can.')

                        cy.wrap($body).contains('Are you an existing')

                        cy.wrap($body).contains("Yes, I'm a customer").click().then(() => {
                          cy.wrap($body).contains('by email')
                          cy.wrap($body)
                            .xpath('/html/body/div/div/div/div[2]/div[1]/main/div/div/div[2]/div[1]/div/div/div/div/div/div/form/fieldset/div/div/div/input')
                            .type('John')

                          cy.wrap($body)
                            .xpath('/html/body/div/div/div/div[2]/div[1]/main/div/div/div[2]/div[1]/div/div/div/div/div/div/form/fieldset/div/div/div/div/button')
                            .click()

                          cy.wrap($body).contains('is invalid')

                          cy.wrap($body)
                            .xpath('/html/body/div/div/div/div[2]/div[1]/main/div/div/div[2]/div[1]/div/div/div/div/div/div/form/fieldset/div/div/div/input')
                            .type('John@apple.test')

                          cy.wrap($body)
                            .xpath('/html/body/div/div/div/div[2]/div[1]/main/div/div/div[2]/div[1]/div/div/div/div/div/div/form/fieldset/div/div/div/div/button')
                            .click()

                          cy.wrap($body).contains('Thank you')
                        })
                      })
                })
              })
          })
        })
      })
    })
  })

  it('sessionless 3 never ask email', function () {
    cy.appScenario('app_bot_settings', { email_requirement: 'never' }).then(() => {
      cy.appEval('App.last').then((results) => {
        const appKey = results.key
        cy.visit(`/tester/${appKey}?sessionless=true&lang=en`).then(() => {
         
          cy.wait(2000)

          cy.get('#chaskiq-prime').click()
         
          cy.wait(2000)
          cy.get('iframe:first')
            .then(function ($iframe) {
              const $body = $iframe.contents().find('body')
              expect($body.html()).to.contain('Start a conversation')
              cy.wrap($body)
                .xpath('/html/body/div/div/div/div[2]/div[1]/div[1]/div/div/div/div[2]/div[2]/a[1]')
                .click()
                .then(() => {
                  cy.wrap($body)
                    .xpath('/html/body/div/div/div/div[2]/div[1]/main/div/div/div[4]/div/div/textarea')
                    .should('be.enabled').then(() => {
                      cy.wrap($body)
                        .xpath('/html/body/div/div/div/div[2]/div[1]/main/div/div/div[4]/div/div/textarea')
                        .type('oeoe \n').then(() => {
                          cy.wait(2000)

                          cy.wrap($body).contains('will reply as soon as they can.')

                          cy.wrap($body).contains('oeoe')
                          cy.wrap($body).contains('Are you an existing')
                          cy.wrap($body).contains("I'm a customer").click()
                          cy.wrap($body).contains("reply button: Yes, I'm a customer")
                          //cy.wrap($body).contains("You replied Yes, I'm a customer")
                          cy.wrap($body).contains('you will get a reply from one of our agents')
                        })
                    })
                })
            })
        })
      })
    })
  })
})

describe('start conversation welcome bot', function () {
  it('start_conversation', function () {
    cy.appScenario('basic')

    cy.appEval('App.last').then((results) => {
      const appKey = results.key
      cy.app('new_conversation_bot_task_command', {
        app_key: appKey
      })
    })

    //helpers.openMessenger("?jwt=true", ($body, appKey) => {
    helpers.openMessenger("", ($body, appKey) => {

      cy.wait(6000)
      expect($body.html()).to.contain('Start a conversation')

      cy.wrap($body)
        .xpath('/html/body/div/div/div/div[2]/div[1]/div[1]/div/div/div/div[2]/div[2]/a[1]')
        .click()
        .then(() => {
          cy.wrap($body).contains('see more?').click().then(()=>{
            cy.wait(2000)
            cy.wrap($body).contains('sauper!')

            cy.wrap($body)
              .xpath('/html/body/div/div/div/div[2]/div[1]/main/div/div/div[4]/div/div/textarea')
              .should('be.enabled').then(() => {
                cy.wait(2000)
                cy.wrap($body)
                  .xpath('/html/body/div/div/div/div[2]/div[1]/main/div/div/div[4]/div/div/textarea')
                  .type('oeoe \n').then(() => {
                    cy.wrap($body).contains('oeoe')
                    cy.wrap($body).contains('go to!').click()
                    cy.wrap($body).contains('ah ah !')
                  })
              })
          })

        })
    })

    helpers.openMessenger("", ($body, appKey) => {
      //expect($body.html()).to.contain('Start a conversation')

      console.log($body.html())
      cy.wait(2000)
      cy.wrap($body)
        .xpath('/html/body/div/div/div/div[2]/div[1]/div[1]/div/div/div/div[2]/div[2]/a[1]')
        .click()
        .then(() => {
          cy.wrap($body).contains('see more?').click().then(()=>{
            cy.wait(1500)
            cy.wrap($body).contains('sauper!')
  
            cy.wrap($body)
              .xpath('/html/body/div/div/div/div[2]/div[1]/main/div/div/div[4]/div/div/textarea')
              .should('be.enabled').then(() => {
                cy.wait(2000)
                cy.wrap($body)
                  .xpath('/html/body/div/div/div/div[2]/div[1]/main/div/div/div[4]/div/div/textarea')
                  .type('oeoe \n').then(() => {
                    cy.wrap($body).contains('oeoe')
                    cy.wrap($body).contains('go to!').click()
                    cy.wrap($body).contains('ah ah !')
                  })
              })

          })
        })
    })
  })
})
