export function translations(){
  cy.appEval(`App.last.update({
    greetings_es: "Hola amigo", 
    greetings_en: "hello friend",

    intro_en: "we are here to help",
    tagline_en: "estamos aqui para ayudarte",

    intro_es: "somos un equipo genial",
    tagline_es: "we are an awesome team"
  })`)
}

export function openMessenger(cb, options, sessionless){

  cy.appEval("App.last").then((results) => {
    const appKey = results.key
    const params = options.params
    let urlParams = params 
    if(sessionless)
      urlParams = Object.assign(
        urlParams, {}, {sessionless: sessionless }
      )

    cy.visit(`/tester/${appKey}`, {qs: urlParams, headers: options.headers || {}})
    .then(()=>{
      cy.get('iframe:first')
      .then(function ($iframe) {
        const $body = $iframe.contents().find('body')
        cy.wrap($body).find("#chaskiq-prime").click()
      })

      cy.get('iframe:first')
      .then(function ($iframe) {
        const $body = $iframe.contents().find('body')
        cb($body, appKey )
      })
    });
  })
}