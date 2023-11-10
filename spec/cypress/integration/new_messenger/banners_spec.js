
describe('Banners Spec', function () {
  it('will open, hidden on next visit', function () {
    cy.appScenario('basic')

    cy.appEval('App.last').then((results) => {
      const appKey = results.key
      cy.app('banner_command', {
        serialized_content: "tatecallaoe",
        app_key: appKey,
        url: '',
        mode: 'inline',
        bg_color: '#bd10e0',
        placement: 'top',
        action_text: 'action',
        show_sender: '',
        dismiss_button: 'true',
        hidden_constraints: ['open']
      }).then(() => {
        cy.visit(`/tester/${appKey}`)
        cy.wait(3000)
        cy.get('iframe[data-cy=banner-wrapper]')
          .then(function ($iframe) {
            let $body = $iframe.contents().find('body')
       
            cy.wrap($body).find('button[type=submit]').then(($el)=>{
              //$el.click()

              cy.visit(`/tester/${appKey}`).then(()=>{
                cy.get('iframe[data-cy=banner-wrapper]').should('not.exist')
              })
            })
            
          })
        })
    })
  })

  it('will click, hidden on next visit', function () {
    cy.appScenario('basic')

    cy.appEval('App.last').then((results) => {
      const appKey = results.key
      cy.app('banner_command', {
        serialized_content: "tatecallaoe",
        app_key: appKey,
        url: '',
        mode: 'inline',
        bg_color: '#bd10e0',
        placement: 'top',
        action_text: 'action',
        show_sender: '',
        dismiss_button: 'true',
        hidden_constraints: ['click']
      }).then(() => {
        cy.visit(`/tester/${appKey}`)
        cy.wait(3000)
        cy.get('iframe[data-cy=banner-wrapper]')
          .then(function ($iframe) {
            let $body = $iframe.contents().find('body')
       
            cy.wrap($body).find('button[type=submit]').then(($el)=>{
              $el.click()

              cy.visit(`/tester/${appKey}`).then(()=>{
                cy.get('iframe[data-cy=banner-wrapper]').should('not.exist')
              })
            })
            
          })
        })
    })
  })


  it('will open and close button', function () {
    cy.appScenario('basic')

    cy.appEval('App.last').then((results) => {
      const appKey = results.key
      cy.app('banner_command', {
        serialized_content: "tatecallaoe",
        app_key: appKey,
        url: '',
        mode: 'inline',
        bg_color: '#bd10e0',
        placement: 'top',
        action_text: 'action',
        show_sender: '',
        dismiss_button: 'true',
        hidden_constraints: ['close']
      }).then(() => {
        cy.visit(`/tester/${appKey}`)
        cy.wait(3000)
        cy.get('iframe[data-cy=banner-wrapper]')
          .then(function ($iframe) {
            let $body = $iframe.contents().find('body')
       
            cy.wrap($body).find('.dismiss-button').then(($el)=>{
              $el.click()

              cy.visit(`/tester/${appKey}`).then(()=>{
                cy.get('iframe[data-cy=banner-wrapper]').should('not.exist')
              })
            })
            
          })
        })
    })
  })

  it('will open and keep open', function () {
    cy.appScenario('basic')

    cy.appEval('App.last').then((results) => {
      const appKey = results.key
      cy.app('banner_command', {
        serialized_content: 'tatecallaoe',
        app_key: appKey,
        url: '',
        mode: 'inline',
        bg_color: '#bd10e0',
        placement: 'top',
        action_text: '',
        show_sender: '',
        dismiss_button: 'true',
        hidden_constraints: ['close']
      }).then(() => {
        cy.visit(`/tester/${appKey}`)
        cy.wait(3000)
        cy.get('iframe[data-cy=banner-wrapper]')
        .then(function ($iframe) {
          let $body = $iframe.contents().find('body')
          cy.wrap($body).find('button[type=submit]').then(($el)=>{
     
            cy.visit(`/tester/${appKey}`).then(()=>{
              cy.get('iframe[data-cy=banner-wrapper]').should('exist')
            })
          })
        })

      })
    })
  })
})
