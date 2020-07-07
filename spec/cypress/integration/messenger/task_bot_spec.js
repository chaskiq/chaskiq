describe('Task bot Spec', function () {
  beforeEach(() => {
    cy.appEval('ActiveJob::Base.queue_adapter = :test')
    cy.appEval('ActiveJob::Base.queue_adapter.perform_enqueued_at_jobs = true')
    // cy.appEval('Redis.current.del("app_user:1:trigger_locked")')
  })

  it('sessionless never ask email', function () {

    cy.appScenario('app_bot_settings', { email_requirement: 'never' }).then(() => {
      cy.appEval('App.last').then((results) => {
        const appKey = results.key

        cy.visit(`/tester/${appKey}?sessionless=true&lang=en`).then(() => {
          cy.get('iframe:first')
            .then(function ($iframe) {
              const $body = $iframe.contents().find('body')
              cy.wrap($body).find('#chaskiq-prime').click()
            })

          cy.get('iframe:first')
            .then(function ($iframe) {
              const $body = $iframe.contents().find('body')
              expect($body.html()).to.contain('Start a conversation')

              cy.wrap($body)
                .xpath('/html/body/div/div/div/div[2]/div/div[1]/div/div/div[2]/a[1]')
                .click()
                .then(() => {
                  cy.wrap($body)
                    .xpath('/html/body/div/div/div/div[2]/div/div/div/div[2]/div/div/textarea')
                    .should('be.enabled').then(() => {
                      cy.wrap($body)
                        .xpath('/html/body/div/div/div/div[2]/div/div/div/div[2]/div/div/textarea')
                        .type('oeoe \n')

                      cy.wrap($body).contains('will reply as soon as they can.')
                    })
                })
            })
        })
      })
    })
  })

  it('sessionless 2 always ask email', function () {
    cy.wait(5000)
    cy.appScenario('app_bot_settings', { email_requirement: 'Always' }).then((results) => {
      cy.appEval('App.last').then((results) => {
        const appKey = results.key
        cy.visit(`/tester/${appKey}?sessionless=true&lang=en`).then(() => {
          cy.get('iframe:first')
            .then(function ($iframe) {
              const $body = $iframe.contents().find('body')
              cy.wrap($body).find('#chaskiq-prime').click()
            })

          cy.get('iframe:first')
            .then(function ($iframe) {
              const $body = $iframe.contents().find('body')
              expect($body.html()).to.contain('Start a conversation')

              cy.wrap($body)
                .xpath('/html/body/div/div/div/div[2]/div/div[1]/div/div/div[2]/a[1]')
                .click()
                .then(() => {
                  cy.wrap($body)
                    .xpath('/html/body/div/div/div/div[2]/div/div/div/div[2]/div/div/textarea')
                    .should('be.enabled').then(() => {
                      cy.wrap($body)
                        .xpath('/html/body/div/div/div/div[2]/div/div/div/div[2]/div/div/textarea')
                        .type('oeoe \n').then(() => {
                          cy.wait(2000)

                          cy.wrap($body).contains('will reply as soon as they can.')

                          // cy.wrap($body).contains("oeoe")

                          cy.wrap($body).contains('Are you an existing')
                          cy.wrap($body).contains("Yes, I'm a customer").click().then(() => {
                            cy.wrap($body).contains('Enter your email')

                            cy.wrap($body)
                              .xpath('/html/body/div/div/div/div[2]/div/div/div/div[1]/div[1]/form/div/input')
                              .type('John@apple.cl')

                            cy.wrap($body)
                              .xpath('/html/body/div/div/div/div[2]/div/div/div/div[1]/div[1]/form/div/button')
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
          cy.get('iframe:first')
            .then(function ($iframe) {
              const $body = $iframe.contents().find('body')
              cy.wrap($body).find('#chaskiq-prime').click()
            })

          cy.get('iframe:first')
            .then(function ($iframe) {
              const $body = $iframe.contents().find('body')
              expect($body.html()).to.contain('Start a conversation')

              cy.wrap($body)
                .xpath('/html/body/div/div/div/div[2]/div/div[1]/div/div/div[2]/a[1]')
                .click()
                .then(() => {
                  cy.wrap($body)
                    .xpath('/html/body/div/div/div/div[2]/div/div/div/div[2]/div/div/textarea')
                    .should('be.enabled').then(() => {
                      cy.wrap($body)
                        .xpath('/html/body/div/div/div/div[2]/div/div/div/div[2]/div/div/textarea')
                        .type('oeoe \n').then(() => {
                          cy.wait(2000)

                          cy.wrap($body).contains('will reply as soon as they can.')

                          //cy.wrap($body).contains('oeoe')
                          cy.wrap($body).contains('Are you an existing')
                          cy.wrap($body).contains("I'm a customer").click()
                          cy.wrap($body).contains("You replied Yes, I'm a customer")
                          cy.wrap($body).contains('you will get a reply from one of our agents')
                        })
                    })
                })
            })
        })
      })
    })
  })


  it('sessionless bot task wait for reply', function() {
    cy.appScenario('basic')

    beforeEach(() => {
      cy.appEval('ActiveJob::Base.queue_adapter = :test')
      cy.appEval('ActiveJob::Base.queue_adapter.perform_enqueued_at_jobs = true')
      cy.appEval('Redis.current.del("app_user:1:trigger_locked")')
    })
    
    cy.appEval("App.last").then((results) => {
      const appKey = results.key
      cy.app("bot_task_command", {
        app_key: appKey,
      }).then((res)=>{

        cy.log(res)

        cy.visit(`/tester/${appKey}?sessionless=true`).then(()=>{


          cy.get('[data-chaskiq-container] iframe')
          .then( function ($iframe) {
            const $body = $iframe.contents().find('body')

            cy.wrap($body).contains('one')
            cy.wrap($body).contains('two')
            cy.wrap($body).contains('tree')

            cy.wrap($body)
              .xpath('/html/body/div/div/div/div[2]/div/div/div/div[2]/div/div/textarea')
              .type('oeoe \n')
              cy.wrap($body).contains('four')
          })
          
        })
      })
    })
  })


})
