function openMessenger (path, cb) {
  cy.appEval('App.last').then((results) => {
    const appKey = results.key
    cy.visit(`/tester/${appKey}${path}`)
      .then(() => {

        cy.get('#chaskiq-prime').click().then(()=>{
          cy.wait(2000)
          cy.get('iframe:first')
          .then(function ($iframe) {
            const $body = $iframe.contents().find('body')
            cb($body, appKey)
          })

        })


      })
  })
}

export default {
  openMessenger: openMessenger
}
