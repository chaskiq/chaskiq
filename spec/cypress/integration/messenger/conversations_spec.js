
describe('Conversation Spec', function () {
  describe('run previous', function () {
    it('run previous conversations', function () {
      cy.appScenario('start_conversation_from_agent')

      openMessenger(($body) => {
        expect($body.html()).to.contain('Start a conversation')
        cy.appEval('App.last.app_users.size').then((res) => {
          expect(res).to.equal(1)
        })

        cy.wrap($body).contains('a few seconds ago')
        cy.wrap($body).xpath('/html/body/div/div/div/div[2]/div/div[1]/div[2]/div')
          .click().then(() => {
            cy.wrap($body)
              .contains('foobar')

            cy.wrap($body)
              .xpath('/html/body/div/div/div/div[2]/div/div/div/div[2]/div/div/textarea')
              .type('oeoe \n').then(() => {
                cy.wrap($body).contains('oeoe')
              })
          })
      })
    })
  })

  describe('open conversation blocked replies ', function () {
    it('will show cta for new conversation, replies blocked', function () {
      cy.appScenario('start_conversation_from_agent')

      cy.appEval(`
      Conversation.last.close!
      App.last.update(inbound_settings: {
        "enabled"=>true, 
        "users"=>{
          "enabled"=>true, 
          "segment"=>"some", 
          "close_conversations_enabled"=>true, 
          "close_conversations_after"=>0
        }, 
        "visitors"=>{
          "visitors_enable_inbound"=>true, 
          "enabled"=>true, 
          "segment"=>"all", 
          "close_conversations_after"=>-1
        }
      })
      `).then((res) => {
        // expect(res).to.equal(1)
      })

      openMessenger(($body) => {
        cy.wrap($body).contains('a few seconds ago')
        cy.wrap($body).xpath('/html/body/div/div/div/div[2]/div/div[1]/div[2]/div')
          .click().then(() => {
            cy.wrap($body)
              .contains('foobar')

            cy.wrap($body)
              .contains('This conversation has ended')

            cy.wrap($body)
              .contains('create new conversation').click()

          })
      })
    })


    it('will show cta for conversation closed, replies blocked', function () {
      cy.appScenario('start_conversation_from_agent')

      cy.appEval(`
      App.last.update(inbound_settings: {
        "enabled"=>true, 
        "users"=>{
          "enabled"=>true, 
          "segment"=>"some", 
          "close_conversations_enabled"=>true, 
          "close_conversations_after"=>0
        }, 
        "visitors"=>{
          "visitors_enable_inbound"=>true, 
          "enabled"=>true, 
          "segment"=>"all", 
          "close_conversations_after"=>-1
        }
      })
      `).then((res) => {
        // expect(res).to.equal(1)
      })

      openMessenger(($body) => {
        cy.wrap($body).contains('a few seconds ago')
        cy.wrap($body).xpath('/html/body/div/div/div/div[2]/div/div[1]/div[2]/div')
          .click().then(() => {
            cy.wrap($body)
              .contains('foobar')

            cy.appEval(`Conversation.last.close!`)

            cy.wrap($body)
              .contains('This conversation has ended')

            cy.wrap($body)
              .contains('create new conversation')

          })
      })
    })

    it('will show textarea', function () {
      cy.appScenario('start_conversation_from_agent')

      cy.appEval(`
      Conversation.last.close!
      App.last.update(inbound_settings: {
        "enabled"=>true, 
        "users"=>{
          "enabled"=>true, 
          "segment"=>"some", 
          "close_conversations_enabled"=>false, 
          "close_conversations_after"=>0
        }, 
        "visitors"=>{
          "visitors_enable_inbound"=>true, 
          "enabled"=>true, 
          "segment"=>"all", 
          "close_conversations_after"=>-1
        }
      })
      `).then((res) => {
        // expect(res).to.equal(1)
      })

      openMessenger(($body) => {
        cy.wrap($body).contains('a few seconds ago')
        cy.wrap($body).xpath('/html/body/div/div/div/div[2]/div/div[1]/div[2]/div')
          .click().then(() => {
            cy.wrap($body)
              .xpath('/html/body/div/div/div/div[2]/div/div/div/div[2]/div/div/textarea')
              .should('be.enabled')

          })
      })
    })
  })

  describe('basic', function () {
    it('start_conversation', function () {
      cy.appScenario('basic')
      openMessenger(($body, appKey) => {
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
                    cy.wrap($body).contains('oeoe')

                    cy.app('start_conversation_command', { text: '11111', app_key: appKey, rules: [] })

                    cy.wrap($body).contains('was assigned to this conversation')
                    cy.wrap($body).contains('11111')
                  })
              })
          })
      })
    })
  })

  function openMessenger (cb) {
    cy.appEval('App.last').then((results) => {
      const appKey = results.key
      cy.visit(`/tester/${appKey}`)
        .then(() => {
          cy.get('iframe:first')
            .then(function ($iframe) {
              const $body = $iframe.contents().find('body')
              cy.wrap($body).find('#chaskiq-prime').click()
            })

          cy.get('iframe:first')
            .then(function ($iframe) {
              const $body = $iframe.contents().find('body')
              cb($body, appKey)
            })
        })
    })
  }
})
