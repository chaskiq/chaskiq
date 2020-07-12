function openMessenger (path, cb) {
  cy.appEval('App.last').then((results) => {
    const appKey = results.key
    cy.visit(`/tester/${appKey}${path}`)
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

export default {
  openMessenger: openMessenger
}