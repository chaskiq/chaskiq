
describe('Banners Spec', function () {
  it('will open and close button', function () {
    cy.appScenario('basic')

    cy.appEval('App.last').then((results) => {
      const appKey = results.key
      cy.app('banner_command', {
        serialized_content: '{"blocks":[{"key":"f1qmb","text":"tatecallaoe","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}',
        app_key: appKey,
        url: '',
        mode: 'inline',
        bg_color: '#bd10e0',
        placement: 'top',
        action_text: '',
        show_sender: '',
        dismiss_button: 'true',
        hidden_constraints: ['open']
      }).then(() => {
        cy.visit(`/tester/${appKey}`)
        cy.get('iframe[data-cy=banner-wrapper]')
          .then(function ($iframe) {
            const $body = $iframe.contents().find('body')
            cy.wrap($body).find('button').click()
            cy.visit(`/tester/${appKey}`)
            cy.get('iframe[data-cy=banner-wrapper]').should('not.exist')
          })
      })
    })
  })

  it('will open and keep open', function () {
    cy.appScenario('basic')

    cy.appEval('App.last').then((results) => {
      const appKey = results.key
      cy.app('banner_command', {
        serialized_content: '{"blocks":[{"key":"f1qmb","text":"tatecallaoe","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}',
        app_key: appKey,
        url: '',
        mode: 'inline',
        bg_color: '#bd10e0',
        placement: 'top',
        action_text: '',
        show_sender: '',
        dismiss_button: 'true',
        hidden_constraints: ['open']
      }).then(() => {
        cy.visit(`/tester/${appKey}`)
        cy.get('iframe[data-cy=banner-wrapper]')
          .then(function ($iframe) {
            const $body = $iframe.contents().find('body')
            cy.visit(`/tester/${appKey}`)
            cy.get('iframe[data-cy=banner-wrapper]').should('exist')
          })
      })
    })
  })
})
