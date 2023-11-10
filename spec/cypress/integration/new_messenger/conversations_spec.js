describe('Conversation Spec', function () {
  describe('run previous', function () {
    it('run previous conversations', function () {
      cy.appScenario('start_conversation_from_agent');

      openMessenger(($body) => {
        expect($body.html()).to.contain('Start a conversation');
        cy.appEval('App.last.app_users.size').then((res) => {
          expect(res).to.equal(1);
        });

        cy.wrap($body).contains('a few seconds ago');
        cy.wrap($body)
          .xpath('//*[@id="conversations-list"]/a')
          .click()
          .then(() => {
            cy.wrap($body).contains('foobar');

            cy.wrap($body)
              .xpath(
                '//*[@id="main-content"]/div/div/div[3]/div/div/textarea'
              )
              .type('oeoe \n')
              .then(() => {
                cy.wrap($body).contains('oeoe');
              });
          });
      });
    });
  });

  describe('open conversation blocked replies ', function () {
    it('will show cta for new conversation, replies blocked', function () {
      cy.appScenario('start_conversation_from_agent');

      cy.appEval(
        `
      Conversation.last.close!
      App.last.update(inbound_settings: {
        "enabled"=>true, 
        "users"=>{
          "enabled"=>true, 
          "enabled_inbound"=>true,
          "segment"=>"some", 
          "close_conversations_enabled"=>true, 
          "close_conversations_after"=>0
        }, 
        "visitors"=>{
          "visitors_enable_inbound"=>true, 
          "enabled"=>true, 
          "enabled_inbound"=>true,
          "segment"=>"all", 
          "close_conversations_after"=>-1
        }
      })
      `
      ).then((res) => {
        // expect(res).to.equal(1)
      });

      cy.wait(2000)

      openMessenger(($body) => {
        cy.wrap($body).contains('a few seconds ago');
        cy.wrap($body)
          .xpath('//*[@id="conversations-list"]/a')
          .click()
          .then(() => {
            cy.wrap($body).contains('foobar');

            cy.wrap($body).contains('This conversation has ended');

            cy.wrap($body).contains('Start a conversation').click();
          });
      });
    });

    it('will show cta for conversation closed, replies blocked', function () {
      cy.appScenario('start_conversation_from_agent');

      cy.appEval(`App.last.update(inbound_settings: {
        "enabled"=>true, 
        "users"=>{
          "enabled"=>true,
          "enabled_inbound"=>true,
          "segment"=>"some", 
          "close_conversations_enabled"=>true, 
          "close_conversations_after"=>0
        }, 
        "visitors"=>{
          "enabled_inbound"=>true, 
          "enabled"=>true, 
          "segment"=>"all", 
          "close_conversations_after"=>-1
        }
      })`
      ).then((res) => {
        // expect(res).to.equal(1)
      });

      cy.wait(2000)

      openMessenger(($body) => {

        
        cy.wrap($body).contains('a few seconds ago');

        cy.wait(1000)
        cy.wrap($body)
          .xpath('//*[@id="conversations-list"]/a')
          .click()
          .then(() => {
            cy.wrap($body).contains('foobar');

            cy.appEval(`Conversation.last.close!`);

            //cy.wait(2000);

            cy.wrap($body).contains('This conversation has ended');

            cy.wrap($body).contains('Start a conversation');
          });
      });
    });

    it('will show textarea', function () {
      cy.appScenario('start_conversation_from_agent');

      cy.appEval(
        `
      Conversation.last.close!
      App.last.update(inbound_settings: {
        "enabled"=>true, 
        "users"=>{
          "enabled"=>true, 
          "enabled_inbound"=>true,
          "segment"=>"some", 
          "close_conversations_enabled"=>false, 
          "close_conversations_after"=>0
        }, 
        "visitors"=>{
          "enabled_inbound"=>true,
          "visitors_enable_inbound"=>true, 
          "enabled"=>true, 
          "segment"=>"all", 
          "close_conversations_after"=>-1
        }
      })
      `
      ).then((res) => {
        // expect(res).to.equal(1)
      });


      cy.wait(2000)
      openMessenger(($body) => {
        cy.wrap($body).contains('a few seconds ago');
        cy.wrap($body)
        .xpath('//*[@id="conversations-list"]/a')
        .click()
          .then(() => {
            cy.wrap($body)
              .xpath(
                '//*[@id="main-content"]/div/div/div[3]/div/div/textarea'
              )
              .should('be.enabled');
          });
      });
    });
  });

  describe('basic', function () {
    it('start_conversation', function () {
      cy.appScenario('basic');
      openMessenger(($body, appKey) => {
        expect($body.html()).to.contain('Start a conversation');


        cy.wrap($body).xpath('//*[@id="bbbb"]/div[1]/div[2]/div/div[2]/div[2]/a[1]').click()


        cy.wrap($body).find('textarea')
        .should('be.visible')
        .type('oeoe \n')


        cy.wrap($body).contains('oeoe');

        cy.app('start_conversation_command', {
          text: '11111',
          app_key: appKey,
          rules: [],
        });

        cy.wrap($body).find('textarea')
        .should('be.visible')
        .type('oeoe \n')

        //cy.wrap($body).get('//*[@id="text_editor-"]/div/div/textarea')
        //.type('oeoe \n')

        /*cy.wrap($body).contains(
          'was assigned to this conversation'
        );*/
        
        //cy.wrap($body).contains('11111');



        /*cy.wrap($body)
          .xpath('//*[@id="bbbb"]/div[1]/div[2]/div/div[2]/div[2]/a[1]')
          .click()
          .then(() => {
            cy.wait(2000)

            cy.wrap($body).get(
                'textarea'
              )
              .should('be.visible')
              .then(() => {
                cy.wrap($body)
                  .get('textarea')
                  .type('oeoe \n')
                  .then(() => {
                    cy.wrap($body).contains('oeoe');

                    cy.app('start_conversation_command', {
                      text: '11111',
                      app_key: appKey,
                      rules: [],
                    });

                    cy.wrap($body).get('textarea')
                    .type('oeoe \n')

                    cy.wrap($body).contains(
                      'was assigned to this conversation'
                    );
                    cy.wrap($body).contains('11111');
                  });
              });
          });*/
      });
    });
  });

  function openMessenger(cb) {
    cy.appEval('App.last').then((results) => {
      const appKey = results.key;
      cy.visit(`/tester/${appKey}`).then(() => {
       
        cy.get('#chaskiq-prime').click();

        cy.get('iframe:first').then(function ($iframe) {
          const $body = $iframe.contents().find('body');
          cb($body, appKey);
        });
      });
    });
  }
});
